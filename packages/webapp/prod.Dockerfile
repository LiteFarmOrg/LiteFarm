FROM node:16.13.2 as build

WORKDIR /usr/src/app

COPY ./package*.json /usr/src/app/

RUN npm i pnpm -g && pnpm i

COPY ./ /usr/src/app/

RUN pnpm run build

FROM nginx:1.15

COPY --from=build /usr/src/app/dist /var/www/litefarm

COPY --from=build /usr/src/app/nginx.conf /etc/nginx/

EXPOSE 80 443
