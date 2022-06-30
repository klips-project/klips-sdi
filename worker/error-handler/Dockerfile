FROM node:alpine

COPY package.json package-lock.json /home/
WORKDIR /home/
RUN npm install
COPY index.js worker/
CMD ["sh", "-c", "node worker/index.js"]
