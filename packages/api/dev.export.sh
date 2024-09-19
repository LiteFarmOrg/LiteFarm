#!/usr/bin/env bash
set -eu

npm install

cp ../webapp/public/locales/en/crop.json src/jobs/locales/en
cp ../webapp/public/locales/es/crop.json src/jobs/locales/es
cp ../webapp/public/locales/pt/crop.json src/jobs/locales/pt
cp ../webapp/public/locales/fr/crop.json src/jobs/locales/fr

# Give nodemon time to restart the API
sleep 10

npx nodemon --inspect=0.0.0.0:9229 src/jobs/index.js
