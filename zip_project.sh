#!/bin/bash

# Usage: ./zip_project.sh [zipfile_name]
# Default name is preedit.zip if none provided

ZIPFILE=${1:-preedit.zip}

echo "Deleting existing zip files in the current directory..."
rm -f ./*.zip

echo "Creating zip archive: $ZIPFILE"
echo "Excluding hidden files, node_modules/, and dist/..."

zip -r "$ZIPFILE" . \
  -x ".*" "*/.*" \
  -x "node_modules/*" "*/node_modules/*" \
  -x "dist/*" "*/dist/*"

echo "Done."