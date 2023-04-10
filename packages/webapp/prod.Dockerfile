FROM node:16.15.0 as build

WORKDIR /usr/src/app

COPY ./webapp/package.json ./webapp/.npmrc ./webapp/pnpm-lock.yaml /usr/src/app/

RUN npm install pnpm -g && pnpm install

COPY ./webapp/ /usr/src/app/

COPY ./shared/ /usr/src/shared/

RUN pnpm run build

FROM nginx:1.15

COPY --from=build /usr/src/app/dist /var/www/litefarm

COPY --from=build /usr/src/app/nginx.conf /etc/nginx/

EXPOSE 80 443
