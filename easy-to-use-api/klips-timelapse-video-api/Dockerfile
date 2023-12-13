FROM node:18-alpine

WORKDIR /usr/build

COPY ./ ./

RUN npm ci
RUN npm run build

FROM nginx:alpine-slim

RUN apk add curl

HEALTHCHECK CMD curl -f http://localhost/ || exit 1

EXPOSE 80

COPY --from=0 /usr/build/dist/ /usr/share/nginx/html/klips-timelapse-video-api
