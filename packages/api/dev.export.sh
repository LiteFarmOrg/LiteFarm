#!/usr/bin/env bash
set -eu

pnpm install

cp ../webapp/public/locales/en/crop.json src/jobs/locales/en
cp ../webapp/public/locales/es/crop.json src/jobs/locales/es
cp ../webapp/public/locales/pt/crop.json src/jobs/locales/pt
cp ../webapp/public/locales/fr/crop.json src/jobs/locales/fr
cp ../webapp/public/locales/de/crop.json src/jobs/locales/de
cp ../webapp/public/locales/hi/crop.json src/jobs/locales/hi
cp ../webapp/public/locales/pa/crop.json src/jobs/locales/pa
cp ../webapp/public/locales/ml/crop.json src/jobs/locales/ml

# Give nodemon time to restart the API
sleep 10

pnpm dlx nodemon --inspect=0.0.0.0:9229 src/jobs/index.js
