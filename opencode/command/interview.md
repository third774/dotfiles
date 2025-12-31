---
description: Interview the user to flesh out a spec through multiple-choice questions
---

# Specification Interview

Conduct an in-depth interview to help the user flesh out their idea into a complete specification.

## Argument Parsing

**Raw arguments:** $ARGUMENTS

The arguments can be one of:

1. **A path to an existing spec.md file** — read it and use it as the starting point for the interview
2. **A description of what the user wants to be interviewed about** — use this as the seed for generating interview questions

Determine which case applies:

- If the argument looks like a file path (contains `/` or ends in `.md`), attempt to read it as a spec file
- Otherwise, treat the entire argument as the project description to interview about

**Spec file mode:** If a spec file exists, read it and identify gaps, ambiguities, or areas that need more detail.

**Description mode:** If no spec file exists, use the description to begin asking questions from scratch. You will create a `spec.md` file when the interview is complete.

## Interview Process

Interview the user in detail about their idea, covering:

- **Technical implementation** — architecture, data models, APIs, storage, frameworks
- **UI & UX** — user flows, interactions, edge cases, error states, accessibility
- **Concerns & tradeoffs** — performance, scalability, security, complexity vs. simplicity
- **Scope & priorities** — MVP vs. future features, must-haves vs. nice-to-haves
- **Edge cases** — unusual inputs, failure modes, recovery strategies

### Question Guidelines

- **Make questions non-obvious** — dig into things the user might not have considered
- **Be specific** — instead of "how should errors be handled?", ask about specific error scenarios
- **Build on previous answers** — use context from earlier responses to ask deeper follow-ups
- **Challenge assumptions** — if something seems underspecified, probe further

## Question Format

If you have a tool available to you for asking the user questions, use that. Otherwise, present each question as a multiple-choice prompt. Use **numbers (1, 2, 3, 4, etc.)** as option identifiers.

Format each question like this:

```
## Question: [Topic Area]

[Your specific question here]

**Options:**
- **1)** [First option with brief explanation]
- **2)** [Second option with brief explanation]
- **3)** [Third option with brief explanation]
- **4)** [Fourth option if needed]
- **5)** Other (please specify)

Reply with a number, or provide your own answer if none of the options fit.
```

### Option Guidelines

- Provide 3-5 meaningful options that represent real architectural or design choices
- Include trade-offs in the option descriptions when relevant
- Always include an "Other" option so the user can provide their own answer
- Options should be substantive, not just "yes/no" — offer concrete approaches

## Interview Flow

1. **Start with high-level questions** about the overall goal and scope
2. **Drill into specifics** based on the user's responses
3. **Ask one question at a time** — wait for the user's response before continuing
4. **Track coverage** — mentally note which areas you've explored and which remain
5. **Continue until complete** — keep interviewing until you have enough detail to write a comprehensive spec

## Completion

When the interview is complete (you've covered all major areas and the user's responses form a coherent picture):

1. **Summarize what you learned** — briefly recap the key decisions made
2. **Write the spec file:**
   - If the user provided an existing spec file path, update that file with the new details
   - If the user provided a description, create a new `spec.md` file in the current directory
3. **The spec should include:**
   - Overview/summary
   - Goals and non-goals
   - Technical architecture
   - User experience details
   - Edge cases and error handling
   - Open questions (if any remain)

## Example First Question

If the user says: "I want to build a CLI tool for managing dotfiles"

```
## Question: Core Functionality

What should be the primary way users interact with their dotfiles through this tool?

**Options:**
- **1)** Symlink-based — tool creates symlinks from a central repo to their expected locations
- **2)** Copy-based — tool copies files to their destinations, with sync commands to update
- **3)** Template-based — tool processes templates with variables before placing files
- **4)** Git-based — tool wraps git commands with dotfile-aware defaults (like yadm)
- **5)** Other (please specify)

Reply with a letter, or provide your own answer if none of the options fit.
```
