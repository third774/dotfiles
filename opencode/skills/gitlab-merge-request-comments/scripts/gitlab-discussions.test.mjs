import assert from 'node:assert/strict';
import test from 'node:test';
import { parsePayload, validatePostResponse } from './gitlab-discussions.mjs';

const position = {
  base_sha: '1111111111111111111111111111111111111111',
  start_sha: '2222222222222222222222222222222222222222',
  head_sha: '3333333333333333333333333333333333333333',
  new_path: 'src/example.js',
  new_line: 12
};
const inline = {
  type: 'inline',
  api: {
    body: 'Agent-assisted comment: Inline validation fixture.',
    position
  }
};
const topLevel = {
  type: 'top-level',
  api: { body: 'Agent-assisted comment: Top-level validation fixture.' }
};

test('parses explicit inline and top-level comments', () => {
  const payload = parsePayload({
    projectId: 1558,
    mergeRequestIid: 731,
    comments: [inline, topLevel]
  });

  assert.equal(payload.comments[0].type, 'inline');
  assert.equal(payload.comments[1].type, 'top-level');
});

test('rejects a missing comment type', () => {
  assert.throws(() =>
    parsePayload({
      projectId: 1558,
      mergeRequestIid: 731,
      comments: [{ api: inline.api }]
    })
  );
});

test('rejects old-side inline position fields', () => {
  assert.throws(() =>
    parsePayload({
      projectId: 1558,
      mergeRequestIid: 731,
      comments: [
        {
          ...inline,
          api: { ...inline.api, position: { ...position, old_line: 12 } }
        }
      ]
    })
  );
});

test('rejects a body without the required prefix', () => {
  assert.throws(() =>
    parsePayload({
      projectId: 1558,
      mergeRequestIid: 731,
      comments: [{ ...topLevel, api: { body: 'Missing prefix' } }]
    })
  );
});

test('accepts a matching DiffNote response for an inline comment', () => {
  const result = validatePostResponse(inline, {
    id: 'discussion-id',
    notes: [
      {
        id: 7,
        type: 'DiffNote',
        body: inline.api.body,
        position: { new_path: position.new_path, new_line: position.new_line }
      }
    ]
  });

  assert.deepEqual(result, {
    discussionId: 'discussion-id',
    noteId: 7,
    location: 'src/example.js:12'
  });
});

test('rejects a top-level response with a diff position', () => {
  assert.throws(() =>
    validatePostResponse(topLevel, {
      id: 'discussion-id',
      notes: [
        {
          id: 8,
          type: 'DiffNote',
          body: topLevel.api.body,
          position: { new_path: position.new_path, new_line: position.new_line }
        }
      ]
    })
  );
});
