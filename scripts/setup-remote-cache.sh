#!/bin/bash
set -e
echo "=== Turborepo Remote Cache Setup ==="
echo ""
echo "Step 1: Login to Vercel (opens browser)"
npx turbo login
echo ""
echo "Step 2: Link this repo to Vercel Remote Cache"
npx turbo link
echo ""
echo "Done! Remote cache is now active."
echo "Verify by running: npx turbo run build --dry"
