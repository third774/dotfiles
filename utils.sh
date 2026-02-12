resource() {
  source ${HOME}/.zshrc
}

fin() {
  if [ $? -eq 0 ]; then
    # Redirect stdout and stderr of 'say' to /dev/null
    say -v Good\ News "Yay" >/dev/null 2>&1 &
    open -g raycast://confetti
  else
    # Redirect stdout and stderr of 'say' to /dev/null
    say -v Bad\ News "kaboom" >/dev/null 2>&1 &
    open -g "raycast://extensions/raycast/raycast/confetti?emojis=💣🧨💥💥💥"
  fi
}

# Convert markdown (file or stdin) to rich HTML on the clipboard,
# with raw markdown as the plain-text fallback.
# Usage: md2clip file.md
#        cat file.md | md2clip
md2clip() {
  if ! command -v pandoc &>/dev/null; then
    echo "md2clip: pandoc is required but not installed (brew install pandoc)" >&2
    return 1
  fi

  local md
  if [[ -n "$1" ]]; then
    if [[ ! -f "$1" ]]; then
      echo "md2clip: file not found: $1" >&2
      return 1
    fi
    md=$(<"$1")
  elif [[ ! -t 0 ]]; then
    md=$(cat)
  else
    echo "md2clip: pass a markdown file or pipe via stdin" >&2
    return 1
  fi

  local html
  html=$(printf '%s' "$md" | pandoc -f markdown -t html)

  MD2CLIP_HTML="$html" MD2CLIP_PLAIN="$md" osascript -l JavaScript -e '
    ObjC.import("AppKit");
    var env = $.NSProcessInfo.processInfo.environment;
    var html = ObjC.unwrap(env.objectForKey("MD2CLIP_HTML"));
    var plain = ObjC.unwrap(env.objectForKey("MD2CLIP_PLAIN"));
    var pb = $.NSPasteboard.generalPasteboard;
    pb.clearContents;
    pb.setDataForType(
      $.NSString.alloc.initWithUTF8String(html).dataUsingEncoding($.NSUTF8StringEncoding),
      $.NSPasteboardTypeHTML
    );
    pb.setDataForType(
      $.NSString.alloc.initWithUTF8String(plain).dataUsingEncoding($.NSUTF8StringEncoding),
      $.NSPasteboardTypeString
    );
  '

  echo "md2clip: copied as HTML"
}

gu() {
  branch="$1"
  git checkout "$branch"
  git pull
  git checkout -
}

gch() {
  git checkout "$(git branch | fzf | tr -d '[:space:]')"
}

function gs() {
  selected=$( (
    git diff --name-only --diff-filter=ACDMRTUXB
    git ls-files --others --exclude-standard
    git diff --name-only --diff-filter=D
  ) | fzf --multi)
  if [ -n "$selected" ]; then
    git add $(echo $selected | xargs)
  fi
}

function t {
  mkdir -p $(dirname $1)
  touch $1
}

function grecent() {
  local branches branch
  branches=$(git branch --sort=-committerdate --format='%(HEAD) %(color:yellow)%(refname:short)%(color:reset) - %(contents:subject) %(color:green)(%(committerdate:relative)) [%(authorname)]') &&
    branch=$(echo "$branches" | fzf --ansi) &&
    branch=$(echo "$branch" | awk '{print $1}' | tr -d '*') &&
    git checkout "$branch"
}

function newpost() {
  echo '---\n{\n  "title": "",\n  "description": ""\n}\n---\n' >>src/content/blog/new-post.md
}

function ub() {
  branch=$1
  git checkout $branch && git pull && git checkout -
}

function commit() {
  # This script is used to write a conventional commit message.
  # It prompts the user to choose the type of commit as specified in the
  # conventional commit spec. And then prompts for the summary and detailed
  # description of the message and uses the values provided. as the summary and
  # details of the message.
  #
  # If you want to add a simpler version of this script to your dotfiles, use:
  #
  # alias gcm='git commit -m "$(gum input)" -m "$(gum write)"'

  # if [ -z "$(git status -s -uno | grep -v '^ ' | awk '{print $2}')" ]; then
  #     gum confirm "Stage all?" && git add .
  # fi

  TYPE=$(gum choose "fix" "feat" "docs" "style" "refactor" "test" "chore" "revert")
  SCOPE=$(gum input --placeholder "scope")

  # Since the scope is optional, wrap it in parentheses if it has a value.
  test -n "$SCOPE" && SCOPE="($SCOPE)"

  # Pre-populate the input with the type(scope): so that the user may change it
  SUMMARY=$(gum input --value "$TYPE$SCOPE: " --placeholder "Summary of this change")
  DESCRIPTION=$(gum write --placeholder "Details of this change")

  # Commit these changes if user confirms
  gum confirm "Commit changes?" && git commit -m "$SUMMARY" -m "$DESCRIPTION"
}

# git add remote
gar() {
  local url=$(pbpaste)

  # Validate URL format (basic git remote URL patterns)
  if [[ ! "$url" =~ ^(https://|git@|ssh://git@).+\.git$ ]] && [[ ! "$url" =~ ^(https://|git@).+/.+$ ]]; then
    echo "Error: Invalid git remote URL format in clipboard"
    echo "Expected formats: https://github.com/user/repo.git or git@github.com:user/repo.git"
    return 1
  fi

  local username=$(echo "$url" | sed 's/.*[:/]\([^/]*\)\/[^/]*$/\1/')

  if git remote add "$username" "$url" 2>/dev/null; then
    echo "✓ Added remote '$username' -> $url"
  else
    echo "Error: Failed to add remote '$username' (may already exist)"
    return 1
  fi
}
