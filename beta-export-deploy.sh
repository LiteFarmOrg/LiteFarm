#!/usr/bin/env bash
set -eu

cd LiteFarm
git add -A .
git stash
git pull origin integration
export NVM_DIR=~/.nvm
source ~/.nvm/nvm.sh
nvm install 22.23.4
nvm use 22.23.4
node -v
cd packages/api
npm install
pm2 list
pm2 delete all
pm2 start npm --name "queue" -- run "scheduler"
pm2 list