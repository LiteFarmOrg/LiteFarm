#!/bin/bash
app_dir="/usr/src/app"

install() { echo "NODE_ENV: $NODE_ENV" && npm install; } # Install dependencies
migrate() { npx knex migrate:latest --knexfile="$app_dir/.knex/knexfile.js"; } # Migrate db
migrate:rollback() { npx knex migrate:rollback --knexfile="$app_dir/.knex/knexfile.js"; } # Rollback db

serve() { # Start server
  pids=($(pidof node))

  if [ "${#pids[@]}" != 0 ]; then # Server is running
    if [ "$1" == "-f" ]; then
      kill -9 ${pids[@]}
    else
      echo "Server running, add -f to force, terminating the previous process" && return 1
    fi
  fi

  soft_clear; echo "NODE_ENV: $NODE_ENV"

  if [ "$NODE_ENV" == development ]; then
    npx nodemon --inspect=0.0.0.0:9230 /usr/src/app/src/server.js
  else
    npx nodemon /usr/src/app/src/server.js
  fi
}

# https://superuser.com/a/1667623
soft_clear() ( # Clear screen while preserving scrollback
  [ $# != 0 ] && clear "$@" && exit
  h="$(tput lines 2>/dev/null)"
  until [ "$h" -le 0 ]; do printf '\n' && h=$((h-1)); done
  clear -x
)
