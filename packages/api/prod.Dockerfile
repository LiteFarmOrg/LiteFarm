FROM node:16.13.2

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN npm install

COPY . .

RUN npm install -g nodemon

CMD npm run migrate:dev:db && nodemon --exec 'npm run start:prod || echo // `date` >> crashlog.js'
