#!/usr/bin/env bash

set -eu

# We assume we're running as `root` user
# Install pnpm globally
command -v pnpm > /dev/null 2>&1 || { echo "Installing pnpm..."; npm install -g pnpm; }

# Set .pnpm-store location
pnpm config set store-dir /webapp/node_modules/.pnpm-store

echo "Installing modules"

pnpm install --frozen-lockfile
pnpm dev
