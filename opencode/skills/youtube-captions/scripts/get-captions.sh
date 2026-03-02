#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $(basename "$0") <youtube-url> [language]"
  echo ""
  echo "Extract captions from a YouTube video."
  echo ""
  echo "Tries manual subtitles first, then auto-generated, then falls back"
  echo "to downloading audio and transcribing with Whisper."
  echo ""
  echo "Arguments:"
  echo "  youtube-url   YouTube video URL"
  echo "  language      Subtitle language code (default: en)"
  exit 1
}

if [[ $# -lt 1 || "$1" == "-h" || "$1" == "--help" ]]; then
  usage
fi

URL="$1"
LANG="${2:-en}"

# Check dependencies
for cmd in yt-dlp; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: $cmd is not installed." >&2
    exit 1
  fi
done

WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT

VIDEO_ID=$(yt-dlp --get-id "$URL" 2>/dev/null)
if [[ -z "$VIDEO_ID" ]]; then
  echo "Error: could not extract video ID from URL." >&2
  exit 1
fi

# Step 1: Try manual (human-uploaded) subtitles
yt-dlp \
  --write-sub \
  --sub-lang "$LANG" \
  --sub-format vtt \
  --skip-download \
  --no-warnings \
  -o "$WORK_DIR/%(id)s" \
  "$URL" 2>/dev/null || true

SUB_FILE="$WORK_DIR/${VIDEO_ID}.${LANG}.vtt"
if [[ -f "$SUB_FILE" ]]; then
  cat "$SUB_FILE"
  exit 0
fi

# Step 2: Try auto-generated subtitles
yt-dlp \
  --write-auto-sub \
  --sub-lang "$LANG" \
  --sub-format vtt \
  --skip-download \
  --no-warnings \
  -o "$WORK_DIR/%(id)s" \
  "$URL" 2>/dev/null || true

SUB_FILE="$WORK_DIR/${VIDEO_ID}.${LANG}.vtt"
if [[ -f "$SUB_FILE" ]]; then
  cat "$SUB_FILE"
  exit 0
fi

# Step 3: Fall back to audio download + Whisper transcription
if ! command -v whisper &>/dev/null; then
  echo "Error: No subtitles available and whisper is not installed." >&2
  echo "Install with: pip install openai-whisper" >&2
  exit 1
fi

echo "No subtitles found. Downloading audio and transcribing with Whisper..." >&2

yt-dlp \
  -x \
  --audio-format wav \
  --no-warnings \
  -o "$WORK_DIR/audio.%(ext)s" \
  "$URL" 2>/dev/null

AUDIO_FILE="$WORK_DIR/audio.wav"
if [[ ! -f "$AUDIO_FILE" ]]; then
  echo "Error: failed to download audio." >&2
  exit 1
fi

whisper \
  "$AUDIO_FILE" \
  --language "$LANG" \
  --model small \
  --output_format vtt \
  --output_dir "$WORK_DIR" \
  2>/dev/null

WHISPER_VTT="$WORK_DIR/audio.vtt"
if [[ -f "$WHISPER_VTT" ]]; then
  cat "$WHISPER_VTT"
else
  echo "Error: Whisper transcription failed." >&2
  exit 1
fi
