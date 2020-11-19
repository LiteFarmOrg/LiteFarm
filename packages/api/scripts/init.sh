#!/bin/bash
set -e
set -o pipefail

if [ $1 == 'testing' ]
then
  echo "--- Seeding DB with test data ---"
  for i in `seq 1 10`;
    do
      nc -z litefarm-db 5433 && echo Success && break
      echo -n .
      sleep 1
    done
  npm run migrate:dev:db
  nodemon --exec npm start
fi
