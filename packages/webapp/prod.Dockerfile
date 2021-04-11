FROM node:14.16.1 as build

WORKDIR /usr/src/app

COPY ./package*.json /usr/src/app/

RUN npm install

COPY ./ /usr/src/app/

RUN npm run build

FROM nginx:1.15

COPY --from=build /usr/src/app/build /var/www/litefarm

COPY --from=build /usr/src/app/nginx.conf /etc/nginx/

EXPOSE 80
