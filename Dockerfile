FROM node:16-alpine AS build

WORKDIR /fe
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm install

COPY ./src ./src
COPY ./public ./public

RUN npm run build

FROM nginx:stable

COPY ./scripts/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /fe/build /usr/share/nginx/html
