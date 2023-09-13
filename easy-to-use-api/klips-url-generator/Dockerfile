FROM node:18-alpine

WORKDIR /usr/build

COPY ./ ./

RUN npm ci
RUN npm run build

CMD ["npm", "start"]
