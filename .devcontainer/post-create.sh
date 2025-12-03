#!/bin/bash

DIR=`pwd`
echo "Current directory: $DIR"

nvm use

# Install the root package dependencies
npm install

# Install the API package dependencies
cd $DIR/packages/api
npm install

# Install the API package dependencies
cd $DIR/packages/webapp
pnpm install

# Install the shared package dependencies
cd $DIR/packages/shared
npm install

# Copy the default environment files
cp $DIR/packages/api/.env.default $DIR/packages/api/.env
cp $DIR/packages/webapp/.env.default $DIR/packages/webapp/.env

if [ -x "$(command -v docker-compose)" ]; then
  docker-compose up --detach
else
  docker compose up --detach
fi

sleep 10

# Set up the PostgreSQL database used by the app
cd $DIR/packages/api
npm run migrate:dev:db
