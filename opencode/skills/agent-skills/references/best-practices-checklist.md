# Best Practices Checklist

Use this checklist when creating, modifying, or reviewing Agent Skills.

## Core Quality

- [ ] **Description is specific** - Includes key terms and specific capabilities
- [ ] **Description includes triggers** - States both what the skill does AND when to use it
- [ ] **Description uses third person** - "Processes files" not "I process files"
- [ ] **SKILL.md body under 500 lines** - Move details to reference files if longer
- [ ] **No time-sensitive information** - Or placed in "old patterns" section with details tag
- [ ] **Consistent terminology** - Same terms used throughout (not mixing synonyms)
- [ ] **Examples are concrete** - Real inputs/outputs, not abstract descriptions
- [ ] **File references one level deep** - No nested reference chains
- [ ] **Progressive disclosure** - Main file is overview, details in references
- [ ] **Workflows have clear steps** - Numbered steps with checkboxes for tracking

## Structure and Organization

- [ ] **Name matches directory** - `skill-name/SKILL.md` has `name: skill-name`
- [ ] **Name follows rules** - Lowercase, hyphens only, 1-64 chars, no `--`
- [ ] **Clear section hierarchy** - Headings guide the reader logically
- [ ] **Reference files focused** - Each file covers one topic/domain
- [ ] **Long reference files have TOC** - Files over 100 lines include table of contents

## Content Quality

- [ ] **Challenges every token** - No unnecessary explanations of common knowledge
- [ ] **Provides sensible defaults** - Clear recommendations, not just options
- [ ] **Escape hatches documented** - When to deviate from defaults
- [ ] **Decision trees clear** - "If X, do Y. Otherwise, do Z."
- [ ] **Iron laws marked** - Critical rules use `<IMPORTANT>` tags or similar
- [ ] **Anti-patterns documented** - Shows what NOT to do with explanations

## Code and Scripts (if applicable)

- [ ] **Scripts solve problems** - Handle errors rather than punting to agent
- [ ] **Error handling explicit** - Helpful error messages, not just failures
- [ ] **No magic constants** - All values are justified and documented
- [ ] **Dependencies listed** - Required packages clearly stated
- [ ] **Scripts documented** - Clear usage examples with expected output
- [ ] **Forward slashes only** - No Windows-style backslash paths
- [ ] **Validation steps included** - Scripts verify their own output when critical
- [ ] **Feedback loops present** - Run → validate → fix → repeat pattern

## Workflows and Processes

- [ ] **Checklists provided** - Agent can copy and track progress
- [ ] **Steps are atomic** - Each step has one clear action
- [ ] **Verification built in** - Steps to confirm success before proceeding
- [ ] **Rollback documented** - How to recover if something goes wrong
- [ ] **Edge cases covered** - What to do when things don't match the happy path

## Testing and Validation

- [ ] **Tested with real tasks** - Not just theoretical review
- [ ] **Model considerations** - Instructions work for target model capabilities
- [ ] **Discovery tested** - Skill activates when expected based on user prompts
- [ ] **References accessible** - Agent successfully navigates to reference files

## Model-Specific Considerations

Different models need different levels of detail:

| Model | Guidance Level |
|-------|----------------|
| **Haiku** (fast, economical) | More explicit instructions, concrete examples |
| **Sonnet** (balanced) | Clear and efficient, moderate detail |
| **Opus** (powerful reasoning) | Avoid over-explaining, trust inference |

If your skill targets multiple models, aim for instructions that work well with all of them.

## Evaluation-Driven Development

Build evaluations before writing extensive documentation:

1. **Identify gaps** - Run agent on representative tasks without the skill
2. **Document failures** - What context was missing? What went wrong?
3. **Create test scenarios** - 3+ scenarios that test the identified gaps
4. **Establish baseline** - Measure performance without the skill
5. **Write minimal instructions** - Just enough to address the gaps
6. **Iterate** - Execute scenarios, compare to baseline, refine

This ensures you solve actual problems rather than anticipated ones.

## Iterative Development with Claude

The most effective development involves using Claude to help create skills:

1. **Complete a task normally** - Work through a problem, note what context you provided
2. **Identify reusable patterns** - What would help with similar future tasks?
3. **Ask Claude to create the skill** - It understands the format natively
4. **Review for conciseness** - Remove unnecessary explanations
5. **Improve architecture** - Organize content into appropriate reference files
6. **Test with fresh instance** - Use the skill on related tasks
7. **Iterate based on observation** - Refine based on actual agent behavior

## Quick Audit

For a fast quality check, answer these questions:

1. Can someone understand the skill's purpose in 10 seconds?
2. Does the description clearly state when to use this skill?
3. Is SKILL.md under 500 lines?
4. Are all references one level deep?
5. Does terminology stay consistent throughout?
6. Are there clear defaults (not just options)?
7. Do workflows have trackable checklists?

If any answer is "no", that's the first thing to fix.
