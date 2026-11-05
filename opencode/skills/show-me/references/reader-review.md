# Review the explanation as a new reader

The author knows the source and the teaching outline, so the author fills gaps
without noticing them. A reviewer without that context finds the places where a
reader must guess, or must read ahead to understand the current point.

This review is separate from source verification and visual review. It checks
whether the explanation is clear to its reader, not whether its claims are true.

## When to run it

- Always for HTML and for other built artifacts, such as slides or video.
- For chat, when the explanation has several sections or steps. Skip it for a
  short answer.
- Run it on the final content: after source verification and, for HTML, after
  the visual review.

## Start the reviewer

Start one `general` subagent with a fresh context. Give it only:

- The user's question, in the user's words.
- The reader's starting knowledge: by default, the language and framework but
  not the codebase.
- The explanation in the form the reader gets it: the chat text, or the built
  HTML path through `file://` with screenshots of each state. For slides or
  video, give the on-screen and spoken text in order, with frames when available.

Do not give it the teaching outline, source code, your notes, or the intended
conclusions. These fill the gaps that the review must find. Tell it to work
read-only, not to open the project source, and not to start other subagents.

Use a prompt like this:

```text
You are reviewing an explanation as its intended reader. Read it once, in
order. Do not open project source files or search for missing context; report
the gaps instead. Work read-only and start no subagents.

Reader: knows <language/framework>, does not know this codebase.
The reader asked: "<user's question>"
Explanation: <text, or file:// path and screenshot paths>

Report:
1. Headings: for each heading, what you expected the section to say before you
   read it. Did the heading tell you anything on its own?
2. Backfill: each term, label, value, or claim whose meaning you got only later,
   or never. Quote it and say where its meaning appeared, if anywhere.
3. Jumps: each step whose connection to the previous step you had to guess.
4. Summary: the main points in your own words, in 3–5 sentences, and any
   question you still have.
```

## Act on the results

- Compare the reviewer's summary with the goal from section 2 of the skill. A
  wrong or missing point shows a gap in the explanation, not a reviewer error.
- Fix the cause: order, definitions, connections, or headings. Do not only
  reword the quoted text. Check the whole explanation for the same problem.
- The findings are evidence about the reader's experience, not about the
  source. Do not change a verified claim to match a reviewer's guess.
- If the fixes change the structure, run one more review with a new subagent.
  A reused reviewer remembers the earlier version.
- If subagents are not available, read the final explanation in order as the
  target reader, answer the four questions yourself, and state in the report
  that no independent review ran.

Report the number of findings, the changes you made, and any finding that you
did not fix, with the reason.
