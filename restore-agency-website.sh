#!/bin/bash

# Ensure we are in the repo
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "Not a git repository."; exit 1; }

# Verify the agency-v1 tag exists
AGENCY_COMMIT=$(git rev-parse --short agency-v1^{commit} 2>/dev/null)
if [ -z "$AGENCY_COMMIT" ]; then
    echo "ERROR: Tag agency-v1 not found."
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "ERROR: Your working tree is not clean."
    echo "Please commit or stash your changes before restoring."
    exit 1
fi

CURRENT_COMMIT=$(git rev-parse --short HEAD)

echo "=============================================="
echo "RANDOM FRAMES — AGENCY WEBSITE RESTORE"
echo "=============================================="
echo ""
echo "Current version:"
echo "$CURRENT_COMMIT"
echo ""
echo "Agency snapshot:"
echo "agency-v1"
echo "$AGENCY_COMMIT"
echo ""
echo "WARNING:"
echo "This will restore the original Random Frames"
echo "agency/client-facing website."
echo ""
echo "Your current working tree is clean."
echo ""
echo "Continue?"
echo ""
read -p "Type RESTORE to continue: " confirm

if [ "$confirm" != "RESTORE" ]; then
    echo "Operation cancelled."
    exit 0
fi

echo "Restoring from agency-v1..."

# Safe Git-based restore approach
# Remove files added since agency-v1
git diff --name-only --diff-filter=A agency-v1 HEAD | xargs -I {} git rm -q {} 2>/dev/null || true

# Checkout all files from agency-v1
git checkout agency-v1 -- .

# Commit the restoration
git commit -m "Restore original agency website"

# Push the restored commit to main
git push origin main

echo "Restoration complete! The website has been restored to the agency-v1 snapshot."
