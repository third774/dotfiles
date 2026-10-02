import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

const execFileAsync = promisify(execFile);
const bodyPrefix = 'AI-generated comment:';
const shaPattern = /^[0-9a-f]{40}$/;

const fail = message => {
  throw new Error(message);
};

const record = (value, path) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    fail(`${path} must be an object`);
  return value;
};

const keys = (value, path, expected) => {
  for (const key of Object.keys(value))
    if (!expected.includes(key)) fail(`${path}.${key} is not allowed`);
};

const text = (value, path) => {
  if (typeof value !== 'string' || value.length === 0) fail(`${path} must be a non-empty string`);
  return value;
};

const positiveInteger = (value, path) => {
  if (!Number.isInteger(value) || value <= 0) fail(`${path} must be a positive integer`);
  return value;
};

const sha = (value, path) => {
  const result = text(value, path);
  if (!shaPattern.test(result)) fail(`${path} must be a 40-character lowercase SHA`);
  return result;
};

const commentBody = (value, path) => {
  const result = text(value, path);
  if (!result.startsWith(bodyPrefix)) fail(`${path} must start with ${bodyPrefix}`);
  return result;
};

const position = (value, path) => {
  const item = record(value, path);
  keys(item, path, ['base_sha', 'start_sha', 'head_sha', 'new_path', 'new_line']);
  return {
    base_sha: sha(item.base_sha, `${path}.base_sha`),
    start_sha: sha(item.start_sha, `${path}.start_sha`),
    head_sha: sha(item.head_sha, `${path}.head_sha`),
    new_path: text(item.new_path, `${path}.new_path`),
    new_line: positiveInteger(item.new_line, `${path}.new_line`)
  };
};

const comment = (value, path) => {
  const item = record(value, path);
  keys(item, path, ['type', 'api']);
  if (item.type !== 'inline' && item.type !== 'top-level')
    fail(`${path}.type must be inline or top-level`);
  const api = record(item.api, `${path}.api`);
  if (item.type === 'inline') {
    keys(api, `${path}.api`, ['body', 'position']);
    return {
      type: 'inline',
      api: {
        body: commentBody(api.body, `${path}.api.body`),
        position: position(api.position, `${path}.api.position`)
      }
    };
  }
  keys(api, `${path}.api`, ['body']);
  return {
    type: 'top-level',
    api: { body: commentBody(api.body, `${path}.api.body`) }
  };
};

export const parsePayload = value => {
  const item = record(value, 'payload');
  keys(item, 'payload', ['projectId', 'mergeRequestIid', 'comments']);
  const projectId = item.projectId;
  if (
    (typeof projectId !== 'string' || projectId.length === 0) &&
    (!Number.isInteger(projectId) || projectId <= 0)
  )
    fail('payload.projectId must be a non-empty string or positive integer');
  if (!Array.isArray(item.comments) || item.comments.length === 0)
    fail('payload.comments must be a non-empty array');
  return {
    projectId,
    mergeRequestIid: positiveInteger(item.mergeRequestIid, 'payload.mergeRequestIid'),
    comments: item.comments.map((entry, index) => comment(entry, `payload.comments[${index}]`))
  };
};

export const validatePostResponse = (commentToValidate, response) => {
  const discussion = record(response, 'response');
  const discussionId = text(discussion.id, 'response.id');
  if (!Array.isArray(discussion.notes) || discussion.notes.length === 0)
    fail('response.notes must be a non-empty array');
  const note = discussion.notes.find(item =>
    typeof item === 'object' &&
    item !== null &&
    item.body === commentToValidate.api.body
  );
  if (!note) fail('response does not contain the posted comment body');
  const noteId = positiveInteger(note.id, 'response.notes[].id');
  if (commentToValidate.type === 'inline') {
    if (note.type !== 'DiffNote') fail('response is not a DiffNote');
    const item = record(note.position, 'response.notes[].position');
    if (
      item.new_path !== commentToValidate.api.position.new_path ||
      item.new_line !== commentToValidate.api.position.new_line
    )
      fail('response position does not match the requested inline position');
    return { discussionId, noteId, location: `${item.new_path}:${item.new_line}` };
  }
  if (note.type === 'DiffNote' || note.position !== null && note.position !== undefined)
    fail('response is not a top-level discussion');
  return { discussionId, noteId, location: 'top-level' };
};

const api = async args => {
  const { stdout } = await execFileAsync('glab', ['api', ...args], {
    maxBuffer: 100 * 1024 * 1024
  });
  return stdout;
};

const endpoint = (payload, suffix) =>
  `projects/${payload.projectId}/merge_requests/${payload.mergeRequestIid}${suffix}`;

const changedNewLine = (patch, target) => {
  let lineNumber;
  for (const line of patch.split('\n')) {
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
    if (hunk) {
      lineNumber = Number(hunk[1]);
    } else if (lineNumber !== undefined && line.startsWith('+') && !line.startsWith('+++')) {
      if (lineNumber === target) return true;
      lineNumber += 1;
    } else if (lineNumber !== undefined && !line.startsWith('-') && !line.startsWith('\\')) {
      lineNumber += 1;
    }
  }
  return false;
};

const getDiff = (rawDiff, newPath) =>
  rawDiff.split(/^diff --git /m).find(diff => diff.includes(` b/${newPath}\n`));

const validateInlineComments = async (payload, comments) => {
  if (comments.length === 0) return;
  const versions = JSON.parse(await api([endpoint(payload, '/versions')]));
  if (!Array.isArray(versions) || versions.length === 0) fail('MR has no diff versions');
  const version = versions[0];
  const rawDiff = await api([endpoint(payload, '/raw_diffs')]);
  for (const commentToValidate of comments) {
    const item = commentToValidate.api.position;
    const current =
      item.base_sha === version.base_commit_sha &&
      item.start_sha === version.start_commit_sha &&
      item.head_sha === version.head_commit_sha;
    if (!current) fail(`${item.new_path}:${item.new_line} does not use current version SHAs`);
    const diff = getDiff(rawDiff, item.new_path);
    if (!diff || !changedNewLine(diff, item.new_line))
      fail(`${item.new_path}:${item.new_line} is not a changed new line`);
  }
};

const validate = async payload => {
  await api([endpoint(payload, '')]);
  await validateInlineComments(
    payload,
    payload.comments.filter(commentToValidate => commentToValidate.type === 'inline')
  );
};

const remove = async (payload, response) => {
  try {
    const discussion = record(response, 'response');
    const discussionId = text(discussion.id, 'response.id');
    const note = Array.isArray(discussion.notes) ? discussion.notes[0] : undefined;
    const noteId = note ? positiveInteger(note.id, 'response.notes[0].id') : undefined;
    if (noteId)
      await api([
        '--method',
        'DELETE',
        `${endpoint(payload, '/discussions')}/${discussionId}/notes/${noteId}`
      ]);
  } catch {
    // GitLab did not provide enough data to remove the invalid discussion.
  }
};

const post = async (payload, commentToPost) => {
  await validate({ ...payload, comments: [commentToPost] });
  const args = [
    '--method',
    'POST',
    endpoint(payload, '/discussions'),
    '--form',
    `body=${commentToPost.api.body}`
  ];
  if (commentToPost.type === 'inline') {
    const item = commentToPost.api.position;
    args.push(
      '--form',
      'position[position_type]=text',
      '--form',
      `position[base_sha]=${item.base_sha}`,
      '--form',
      `position[start_sha]=${item.start_sha}`,
      '--form',
      `position[head_sha]=${item.head_sha}`,
      '--form',
      `position[new_path]=${item.new_path}`,
      '--form',
      `position[new_line]=${item.new_line}`
    );
  }
  const response = JSON.parse(await api(args));
  try {
    return validatePostResponse(commentToPost, response);
  } catch (error) {
    await remove(payload, response);
    throw error;
  }
};

const main = async () => {
  const [flag, filePath, mode] = process.argv.slice(2);
  if (flag !== '--file' || !filePath || (mode !== undefined && mode !== '--post'))
    fail('Usage: node gitlab-discussions.mjs --file <payload.json> [--post]');
  const payload = parsePayload(JSON.parse(await readFile(filePath, 'utf8')));
  await validate(payload);
  console.log(`Validated ${payload.comments.length} discussion payload(s).`);
  if (mode !== '--post') return;
  for (const commentToPost of payload.comments) {
    const result = await post(payload, commentToPost);
    console.log(
      `Posted ${commentToPost.type} discussion ${result.discussionId}/${result.noteId} at ${result.location}.`
    );
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
