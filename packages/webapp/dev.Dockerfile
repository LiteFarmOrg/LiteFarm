FROM node:16.13.2

WORKDIR /usr/src/app

COPY ./package.json .

COPY ./pnpm-lock.yaml .

RUN npm i pnpm -g && pnpm i

COPY . .

CMD  pnpm dev
