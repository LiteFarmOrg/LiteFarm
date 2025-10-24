FROM node:22.21

# Install rsync
RUN apt-get update && apt-get install -y rsync

WORKDIR /usr/src/app

COPY ./api/package*.json /usr/src/app/

RUN npm install

COPY ./api/ /usr/src/app/

COPY ./shared/ /usr/src/shared/

RUN npm run build

# Use rsync
RUN npm run cp-uncompiled-to-dist

CMD npm run migrate:dev:db && npm run start:prod || echo // `date` >> crashlog.js 
