#!/usr/bin/env bash
set -euo pipefail

branch="${1:-$(git rev-parse --abbrev-ref HEAD)}"
remote="${2:-origin}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not inside a git repository."
  exit 1
fi

if ! git remote get-url "$remote" >/dev/null 2>&1; then
  echo "Remote '$remote' is missing. Add it first, for example:"
  echo "  git remote add $remote https://github.com/Wayweroll/Nicschatbot.git"
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Working tree is not clean. Commit or stash changes before pushing."
  git status --short
  exit 1
fi

if [[ -z "$(git rev-parse --verify "$branch" 2>/dev/null)" ]]; then
  echo "Branch '$branch' does not exist locally."
  exit 1
fi

echo "Pushing '$branch' to '$remote' and setting upstream..."
if git push -u "$remote" "$branch"; then
  echo "Push complete."
  exit 0
fi

echo "Push failed. Most common fix is GitHub auth:"
echo "  gh auth login"
echo "or configure a Personal Access Token for HTTPS pushes."
exit 1
