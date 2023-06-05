#!/usr/bin/env bash
set -eu

cd ~/LiteFarm
git checkout integration
git pull origin integration
docker-compose -f docker-compose.beta.yml up --build -d