FROM node:20.17

WORKDIR /usr/src/app/api

COPY ./api/package*.json /usr/src/app/api

RUN npm install

COPY ./api/ /usr/src/app/api

COPY ./shared/ /usr/src/app/shared/

RUN npm run build

CMD npm run migrate:dev:db && npm run start:prod || echo // `date` >> crashlog.js 
