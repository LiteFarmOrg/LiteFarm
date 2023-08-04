#!/usr/bin/env bash
set -eu

cd LiteFarm
git add -A .
git stash
git pull origin integration
export NVM_DIR=~/.nvm
source ~/.nvm/nvm.sh
nvm use 18.16.1
node -v
cd packages/api
npm install
pm2 list
pm2 delete all
pm2 start npm --name "queue" -- run "scheduler"
pm2 list