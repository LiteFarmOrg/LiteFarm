FROM node:10.14.0

RUN apt update && apt install -y netcat

WORKDIR /usr/src/app

COPY ./package.json .

COPY ./package-lock.json .

RUN npm install

COPY . .

RUN npm install -g nodemon knex

RUN chmod +x scripts/init.sh

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait

RUN chmod +x /wait

CMD /wait && nodemon --exec npm start
