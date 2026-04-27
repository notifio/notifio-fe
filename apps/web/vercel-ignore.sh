#!/bin/bash
# Vercel Ignored Build Step
# Exit 0 = skip build, exit 1 = proceed.
#
# Skip when only mobile changed. Shared packages (ui, api-client) trigger web
# builds because web depends on them.

echo "Checking for web-relevant changes..."

if [ -z "$VERCEL_GIT_PREVIOUS_SHA" ]; then
  echo "No previous SHA — first deploy or force deploy. Proceeding."
  exit 1
fi

CHANGED_FILES=$(git diff --name-only "$VERCEL_GIT_PREVIOUS_SHA" HEAD)

echo "Changed files since last deploy:"
echo "$CHANGED_FILES"

WEB_RELEVANT=$(echo "$CHANGED_FILES" | grep -E "^(apps/web/|packages/ui/|packages/api-client/|package-lock.json|turbo.json|vercel\.json)")

if [ -n "$WEB_RELEVANT" ]; then
  echo "Web-relevant changes detected. Proceeding with build."
  exit 1
else
  echo "No web-relevant changes. Skipping build."
  exit 0
fi
