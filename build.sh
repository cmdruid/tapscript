#!/bin/bash

# Clean the existing dist path.
rm -rf ./dist

## Build the current project source.
yarn tsc
yarn rollup -c rollup.config.ts --configPlugin typescript

## Remove the webcrypto import from the module file.
sed -i '/import { webcrypto } from '\''crypto'\'';/d' "./dist/module.mjs"
