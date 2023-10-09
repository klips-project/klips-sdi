FROM node:18-alpine

WORKDIR /usr/build
COPY ./ ./

RUN npm ci
RUN npm run build

FROM nginx:alpine-slim

COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY --from=0 /usr/build/dist /usr/share/nginx/html/
COPY --from=0 /usr/build/dist /etc/nginx/html/
EXPOSE 80