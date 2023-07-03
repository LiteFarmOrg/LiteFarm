#!/usr/bin/env bash
set -eu

echo "Building backend docker image..."
docker build --platform linux/amd64 --tag litefarm/backend:latest --file ./packages/api/prod.Dockerfile ./packages/

echo "Building frontend docker image..."
docker build --platform linux/amd64 --tag litefarm/frontend:latest --file ./packages/webapp/prod.Dockerfile ./packages/