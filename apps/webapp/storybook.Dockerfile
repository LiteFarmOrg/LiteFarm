FROM node:10.14.0

WORKDIR /usr/src/app

COPY ./package.json .

COPY ./package-lock.json .

RUN npm install

COPY . .

CMD  npm run storybook
