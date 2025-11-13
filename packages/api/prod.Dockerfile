# syntax=docker.io/docker/dockerfile:1.7-labs
FROM node:22.21 AS builder

# Install rsync
RUN apt-get update && apt-get install -y rsync

WORKDIR /usr/src/app

COPY ./api/package*.json /usr/src/app/

RUN npm install

COPY --exclude=src/jobs ./api/ /usr/src/app/

COPY ./shared/ /usr/src/shared/

RUN npm run build

# Use rsync
RUN npm run cp-uncompiled-to-dist

FROM node:22.21-slim

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./

RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./dist

COPY --from=builder /usr/src/app/.knex ./.knex
COPY --from=builder /usr/src/app/db ./db
COPY --from=builder /usr/src/app/.env ./.env

CMD npm run migrate:dev:db && npm run start:prod || echo // `date` >> crashlog.js 
