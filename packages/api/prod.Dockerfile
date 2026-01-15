FROM node:22.21

# Install rsync
RUN apt-get update && apt-get install -y rsync

WORKDIR /usr/src/app/api

COPY ./api/package*.json /usr/src/app/api

RUN npm install

COPY ./api/ /usr/src/app/api

COPY ./shared/ /usr/src/app/shared/

RUN npm run build

# Use rsync
RUN npm run cp-uncompiled-to-dist

CMD npm run migrate:dev:db && npm run start:prod || echo // `date` >> crashlog.js 
