#!/bin/bash

# Create default environment variable definitions.
cp .env.default .env

# Create main dev database.
psql -c 'CREATE DATABASE "pg-litefarm";'

# Create database for automated tests.
psql -c "CREATE DATABASE test_farm;"

# Create db role (user) 'postgres' if it does not already exist (e.g., in GitPod workspaces).
psql -tc "SELECT 1 FROM pg_user WHERE usename = 'postgres'" | grep -q 1 || psql -c "CREATE ROLE postgres"

# Configure postgres user.
psql -c "ALTER ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';"

# Create tables and populate both databases.
npm run migrate:dev:db
npm run migrate:testing:db
