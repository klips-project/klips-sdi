FROM node:alpine

COPY package.json package-lock.json /home/
COPY wait-for.sh start-worker.sh /home/
RUN chmod +x /home/wait-for.sh /home/start-worker.sh

WORKDIR /home/
RUN npm install
COPY index.js worker/
COPY logger.js worker/

CMD ["./start-worker.sh"]
