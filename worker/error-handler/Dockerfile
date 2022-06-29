FROM node:alpine

COPY src/error-handler/package.json src/error-handler/package-lock.json /home/
WORKDIR /home/
RUN npm install
COPY src/error-handler/index.js worker/
COPY src/workerTemplate.js .
CMD ["sh", "-c", "node worker/index.js"]
