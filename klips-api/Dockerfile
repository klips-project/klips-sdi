FROM node:16-alpine

WORKDIR /usr/build

COPY ./ ./

RUN npm install
RUN npm run build

FROM node:16-alpine

WORKDIR /usr/app

COPY --from=0 /usr/build/dist/ ./dist
COPY --from=0 /usr/build/LICENSE ./
COPY --from=0 /usr/build/package.json ./
COPY --from=0 /usr/build/package-lock.json ./
COPY --from=0 /usr/build/node_modules ./node_modules

COPY util/wait-for.sh util/start-worker.sh ./
RUN chmod +x wait-for.sh start-worker.sh


EXPOSE 3000
ENV NODE_ENV=production

CMD ["./start-worker.sh"]
