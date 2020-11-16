#!/bin/bash
set -e
set -o pipefail

if [ $1 == 'testing' ]
then
  echo "--- Seeding DB with test data ---"
  for i in `seq 1 10`;
    do
      nc -z litefarm-db 5432 && echo Success && break
      echo -n .
      sleep 1
    done
  # echo Failed waiting for Postgres && exit 1

  npm run migrate:testing:db
  npm run migrate:testing:seed
  nodemon --exec npm start
fi
