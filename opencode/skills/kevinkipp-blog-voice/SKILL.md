---
name: kevinkipp-blog-voice
description: Write blog posts for kevinkipp.com in Kevin's voice and style. Use this skill when Kevin explicitly asks to write, draft, or edit a blog post — e.g. "write a post about...", "draft a blog post", "help me write something for my blog". Do NOT use for general writing tasks, emails, docs, or other content that isn't specifically a kevinkipp.com blog post.
---

# Writing in Kevin Kipp's Voice

Kevin writes short, enthusiastic, opinionated blog posts about web development, developer tooling, and life observations. His posts range from one paragraph to a few hundred words — he deliberately keeps things short and doesn't pad.

## Core Voice Characteristics

**Tone**: Casual, genuine, enthusiastic. He gets visibly excited about things he likes. He's opinionated and confident — he doesn't hedge when he has a take.

**Personality markers**:
- Self-aware humor, occasionally self-deprecating ("the ol' build a blog thing", "only to post like once or twice before letting it sit idle for years")
- Genuine excitement expressed directly ("This is delightful.", "I freakin' love it!", "How cool is that?")
- Direct, confident titles that state a fact or take — not clickbait, just... sure of themselves ("Monday is the correct first day of the week", "Your URL is a defacto API")
- Shares real personal problems he actually encountered and solved — not hypotheticals
- Mentions specific tools and products by name with enthusiasm (Raycast, Cloudflare, Script Kit, Astro, Perplexity, Discord)
- Includes specific details that show this is lived experience, not generic advice

**What he avoids**:
- "In this post, I'll..." preambles
- Formal or academic tone
- Heavy hedging or caveating ("it might be worth considering...")
- Passive voice
- Conclusion sections that just repeat what was said
- Unnecessary filler: "certainly", "absolutely", "it's worth noting", "at the end of the day"
- Long windup before the point
- **Teacher-y phrasing** that positions him above the reader: "once you internalize this...", "now you know...", "keep this in mind...", "the key takeaway is...". His posts feel like sharing a discovery with a peer, not instructing. He noticed something cool and is telling you about it — not guiding you through a lesson.

## Post Structure

**Title**: Direct and confident. States the thing. Often sounds like something you'd say out loud.
- Good: "Monday is the correct first day of the week"
- Good: "QR code doorbells"
- Good: "Web Components are sparkles for your HTML"

**Subtitle/tagline**: Optional. Often a teaser or a playful twist on the title. Kept in the frontmatter as `description`.

**Opening**: Gets right into it. Often starts with the problem/context, or just jumps straight to the thing. No throat-clearing.

**Body**: Conversational paragraphs. For technical posts: sets up the problem, then walks through the solution step-by-step with code if needed. For opinion/observation posts: makes the point, supports it with a concrete example or personal experience, maybe a funny aside.

**Ending**: Stops when done. No "Conclusion" header. Sometimes ends with a punchy one-liner. Never a summary of what was just said.

## Sentence-Level Style

- Contractions everywhere: it's, I've, we'll, you're, don't, that's
- Em dashes for asides — like this — used naturally, not overused
- Short punchy sentences mixed with longer explanatory ones
- Rhetorical questions to pull the reader along: "Why does it matter?" / "How cool is that?"
- Parenthetical asides for informal clarifications (the kind you'd say if talking out loud)
- Lists are fine when there are genuinely multiple things; don't manufacture them

## Post Length Philosophy

Kevin deliberately made it easy to post short things. A post can be:
- **Micro** (1-3 paragraphs): "Saw this cool thing, here's why I like it"
- **Short** (3-6 paragraphs): An observation or tip with some context
- **Medium** (6-12 paragraphs): A real problem he solved, with steps
- **Long** (12+ paragraphs): A full walkthrough with code

Don't pad short ideas into medium posts. If it's a micro post, write a micro post.

## Example Passages (to match style, not copy)

**Micro post energy**:
> This sparkling web component from Stefan Judis is awesome. Wrap it around anything to add some sparkles! [...] How cool is that? I freakin' love it!

**Problem-solution opener**:
> The Austin JavaScript Meetup is hosted at Cloudflare, where there are pretty strict policies requiring that the doors not be held open. This means we need one of the organizers to let people in as they arrive [...] which is fine except that once the talk starts we need to either stop letting people in, or someone needs to hang out by the door for a bit and miss a chunk of the talk.

**Opinionated take**:
> It's easy to think that nobody cares what's in your web app's URL. Heck, Safari and Arc [...] have both decided that you don't need to see what's in there unless you're curious.

**Self-aware reflection**:
> Like most front-end developers, I've done the ol' build a blog thing that ends with me spending way more time working on building the blog, only to post like once or twice before letting it sit idle for years.

## How to Write a Post

1. **Identify the core thing**: What's the one observation, tip, tool, or mini-project? Strip everything else.
2. **Pick the right length**: Don't inflate it. Short is fine. Short is good.
3. **Write a direct title**: State the thing confidently.
4. **Start in the middle**: Jump into the context or problem without warming up.
5. **Show, don't tell**: Specific tools, real commands, actual quotes from friends, the specific emoji he used. Concrete details make it feel real.
6. **End when you're done**: No summary, no "let me know in the comments", no "thanks for reading".

## Formatting Notes

- Markdown with `##` headers for sections in longer posts (not every post needs them)
- Code blocks for any code snippets
- No hero image required
- No mandatory description (he removed this requirement on purpose)
- Posts published with ISO date string in frontmatter

