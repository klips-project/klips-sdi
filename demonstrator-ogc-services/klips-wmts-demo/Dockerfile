FROM node:20-alpine as build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN apk add curl

RUN npm ci

COPY . ./

RUN npm run build

FROM nginx:1.25.2-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
