FROM node:16-alpine3.12

COPY  /package.json /opt/package.json

WORKDIR /opt
RUN npm install --only=production

COPY  /wait-for.sh /opt/wait-for.sh
COPY  /010_create-layers.js /opt/010_create-layers.js

RUN chmod +x /opt/wait-for.sh

CMD [ "./wait-for.sh", "geoserver:8080", "--", "npm", "start"]
