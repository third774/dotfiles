---
name: youtube-captions
description: Extract captions and transcripts from YouTube videos for agent context. Tries manual subtitles, then auto-generated, then falls back to audio transcription via Whisper. Use when a user provides a YouTube URL and wants to understand, summarize, reference, or search video content.
---

# youtube-captions

Extract timestamped captions from YouTube videos. Output is VTT format (timestamps preserved).

## Prerequisites

- `yt-dlp` — REQUIRED (`brew install yt-dlp`)
- `openai-whisper` — REQUIRED only if video has no subtitles (`pip install openai-whisper`)
  - First run downloads the `small` model (~500MB)
  - Transcription is significantly slower than subtitle download

## Usage

```bash
bash scripts/get-captions.sh <youtube-url> [language]
```

- `youtube-url` — any valid YouTube video URL
- `language` — subtitle language code (default: `en`)

Output goes to stdout. Status messages go to stderr.

## Fallback Chain

1. **Manual subtitles** — human-uploaded captions (fastest, most accurate)
2. **Auto-generated subtitles** — YouTube's speech recognition
3. **Whisper transcription** — downloads audio, transcribes locally with `whisper --model small`

The script tries each step in order and exits on the first success.

## Example

```bash
# Get English captions
bash scripts/get-captions.sh "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Get Spanish captions
bash scripts/get-captions.sh "https://www.youtube.com/watch?v=dQw4w9WgXcQ" es
```

## Output Format

VTT (Web Video Text Tracks) with timestamps:

```
WEBVTT

00:00:01.000 --> 00:00:04.000
First line of dialogue

00:00:04.000 --> 00:00:08.000
Second line of dialogue
```

## Notes

- All temporary files (audio, intermediate subtitle files) are cleaned up automatically
- If neither yt-dlp subtitles nor Whisper are available, the script exits with an error and clear instructions
- Long videos with no subtitles will take time to transcribe — Whisper processes roughly at 1x realtime on CPU
