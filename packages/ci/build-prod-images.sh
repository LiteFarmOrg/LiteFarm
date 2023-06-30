#!/usr/bin/env bash

echo "Building backend docker image..."
docker build --platform linux/amd64 -t litefarm/backend:latest -f ./packages/api/prod.Dockerfile ./packages/

echo "Building frontend docker image..."
docker build -t litefarm/frontend:latest -f ./packages/webapp/prod.Dockerfile ./packages/