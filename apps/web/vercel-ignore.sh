#!/bin/bash
# Vercel Ignored Build Step
# Exit 0 = skip build, exit 1 = proceed.
#
# Skip when only mobile changed. Shared packages (ui, api-client) trigger web
# builds because web depends on them.
#
# Note: Vercel runs this from the project root directory (apps/web/), but
# `git diff --name-only` returns paths relative to the repo root regardless
# of cwd, so the regex below matches against repo-root paths.

echo "Checking for web-relevant changes..."

if [ -z "$VERCEL_GIT_PREVIOUS_SHA" ]; then
  echo "No previous SHA — first deploy or force deploy. Proceeding."
  exit 1
fi

# Vercel shallow-clones; ensure the previous SHA is reachable for the diff.
if ! git cat-file -e "$VERCEL_GIT_PREVIOUS_SHA" 2>/dev/null; then
  echo "Previous SHA not in history; fetching..."
  git fetch --no-tags --depth=50 origin "$VERCEL_GIT_PREVIOUS_SHA" 2>/dev/null || \
    git fetch --no-tags --unshallow origin 2>/dev/null || true
fi

if ! git cat-file -e "$VERCEL_GIT_PREVIOUS_SHA" 2>/dev/null; then
  echo "Could not fetch previous SHA. Proceeding to be safe."
  exit 1
fi

CHANGED_FILES=$(git diff --name-only "$VERCEL_GIT_PREVIOUS_SHA" HEAD)

echo "Changed files since last deploy:"
echo "$CHANGED_FILES"

WEB_RELEVANT=$(echo "$CHANGED_FILES" | grep -E "^(apps/web/|packages/ui/|packages/api-client/|package-lock.json|turbo.json)")

if [ -n "$WEB_RELEVANT" ]; then
  echo "Web-relevant changes detected. Proceeding with build."
  exit 1
else
  echo "No web-relevant changes. Skipping build."
  exit 0
fi
