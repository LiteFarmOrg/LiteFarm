FROM node:16.15.0

WORKDIR /usr/src/app

COPY ./api/package*.json ./usr/src/app/

RUN npm install

COPY ./api/ /usr/src/app/

COPY ./shared/ /usr/src/shared/

RUN npm install -g nodemon

CMD npm run migrate:dev:db && nodemon --exec 'npm run start:prod || echo // `date` >> crashlog.js'
