FROM node:18-alpine

WORKDIR /usr/build
COPY ./ ./

RUN npm ci
RUN npm run build

FROM nginx:alpine-slim

COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY --from=0 /usr/build/dist /etc/nginx/html/
RUN sed -i 's;/bundle;/easy-to-use-api/warning/bundle;g' /etc/nginx/html/index.html
EXPOSE 80
