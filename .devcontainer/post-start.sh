#!/bin/bash

if [ -x "$(command -v docker-compose)" ]; then
  docker-compose up --detach
else
  docker compose up --detach
fi
