#!/bin/bash

# Usage: ./zip_project.sh [zipfile_name]
# Default name is preedit.zip if none provided

ZIPFILE=${1:-preedit.zip}
BASENAME="${ZIPFILE%.zip}"

echo "Deleting existing zip files in the current directory..."
rm -f ./*.zip

# --- Git branch logic ---

# Find a unique branch name based on basename
BRANCH="$BASENAME"
i=1
while git show-ref --verify --quiet "refs/heads/$BRANCH"; do
  BRANCH="${BASENAME}-$i"
  ((i++))
done

echo "Creating and switching to branch: $BRANCH"
git checkout -b "$BRANCH"

echo "Adding and committing all changes..."
git add .
git commit -m "$BASENAME edits"

echo "Pushing branch '$BRANCH' to origin..."
git push -u origin "$BRANCH"

# --- Zip logic ---

echo "Creating zip archive: $ZIPFILE"
echo "Excluding hidden files, node_modules/, and dist/..."

zip -r "$ZIPFILE" . \
  -x ".*" "*/.*" \
  -x "node_modules/*" "*/node_modules/*" \
  -x "dist/*" "*/dist/*"

echo "Done: branch '$BRANCH' pushed and archive '$ZIPFILE' created."
