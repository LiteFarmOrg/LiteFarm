FROM node:lts

WORKDIR /usr/src/app

COPY ./api/package*.json /usr/src/app/

RUN npm install

COPY ./api/ /usr/src/app/

COPY ./shared/ /usr/src/shared/

CMD npm run migrate:dev:db && npm run start:prod || echo // `date` >> crashlog.js 
