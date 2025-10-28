FROM node:22.21 as build

WORKDIR /usr/src/app

COPY ./webapp/package.json ./webapp/.npmrc ./webapp/package-lock.json /usr/src/app/

RUN npm install

COPY ./webapp/ /usr/src/app/

COPY ./shared/ /usr/src/shared/

RUN npm run build

FROM nginx:1.25.1

COPY --from=build /usr/src/app/dist /var/www/litefarm

COPY --from=build /usr/src/app/nginx.conf /etc/nginx/

EXPOSE 80 443
