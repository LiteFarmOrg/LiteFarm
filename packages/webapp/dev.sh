#!/usr/bin/env bash

set -eu

# We assume we're running as `root` user
# Install pnpm globally
command -v pnpm > /dev/null 2>&1 || { echo "Installing pnpm..."; npm install -g pnpm; }

# Install node modules as `node` user
[[ ! -d "node_modules" ]] && { echo "Installing modules"; su node -c "pnpm install"; }

su node -c "pnpm dev"
