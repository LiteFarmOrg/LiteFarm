#!/bin/bash
app_dir="/usr/src/app"
pnpx() { pnpm exec "$@"; } # Run pnpm binaries in a similar way to npx from npm

install() { pnpm install; } # Install dependencies
precompile() { NODE_OPTIONS=--max_old_space_size=3000 pnpx tsc && pnpx vite build; } # Precompile assets

serve() { # Start server
  pids=($(pidof node))

  if [ "${#pids[@]}" != 0 ]; then # Server is running
    if [ "$1" == "-f" ]; then
      kill -9 ${pids[@]}
    else
      echo "Server running, add -f to force, terminating the previous process" && return 1
    fi
  fi

  CYPRESS_COVERAGE=TRUE pnpx vite --host
}
