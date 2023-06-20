# FROM node:16.15.0 as base
FROM node:18.16.0 as base

WORKDIR /usr/src/app

ADD ./api/package*.json .

RUN npm i

COPY ./api/ /usr/src/app/

COPY ./shared/ /usr/src/shared/

RUN cd /usr/src/shared && npm i
