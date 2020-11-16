FROM node:10.14.0

WORKDIR /usr/src/app

COPY ./package.json .

COPY ./package-lock.json .

RUN npm install && npm install -g nodemon

COPY . .

CMD nodemon --exec npm start
