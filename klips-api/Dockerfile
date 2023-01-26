FROM node:16-bullseye-slim

WORKDIR /usr/build

COPY ./ ./

RUN npm install
RUN npm run build

FROM node:16-bullseye-slim

WORKDIR /usr/app

COPY --from=0 /usr/build/dist/ ./dist
COPY --from=0 /usr/build/LICENSE ./
COPY --from=0 /usr/build/package.json ./
COPY --from=0 /usr/build/package-lock.json ./
COPY --from=0 /usr/build/node_modules ./node_modules

COPY util/wait-for.sh util/start-worker.sh ./
RUN chmod +x wait-for.sh start-worker.sh

RUN apt update
# needed for wait-for script
RUN apt install -y netcat

EXPOSE 3000
ENV NODE_ENV=production

CMD ["./start-worker.sh"]
