#!/usr/bin/env bash

set -eu

# We assume we're running using `node` user
[[ ! -d "node_modules" ]] && { echo "Installing modules..."; npm install; }

npm run migrate:dev:db
npm run nodemon
