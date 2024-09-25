#!/bin/bash

# Clean the existing dist path.
rm -rf ./dist

## Build the current project source.
yarn tsc
yarn rollup -c rollup.config.ts --configPlugin typescript

## Resolve path aliases in files.

DIRECTORY="./dist"                 # The file path to search.
EXTENSIONS=("js" "ts")             # The file extensions to target. Add more extensions as needed.
ABSOLUTE_PATH="@/"                 # The path we are replacing.
DEPTH_OFFSET=3                     # The offset for our depth counter.

for EXTENSION in "${EXTENSIONS[@]}"
do
    # Loop through all files in the directory that match the current extension.
    find "$DIRECTORY" -name "*.$EXTENSION" -type f | while read -r file
    do
        # Count the number of slashes in the file's path to determine its depth
        DEPTH=$(echo "$file" | tr -cd '/' | wc -c)

        # Build a relative path string based on the depth.
        RELATIVE_PATH=""
        for (( i=DEPTH_OFFSET; i<=$DEPTH; i++ ))
        do
            RELATIVE_PATH="../$RELATIVE_PATH"
        done
        # Use sed to perform the in-place replacement.
        sed -i "s|$ABSOLUTE_PATH|$RELATIVE_PATH|g" "$file"
    done
done
