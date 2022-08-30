FROM node:alpine

COPY  /package.json /opt/package.json

WORKDIR /opt
RUN npm install --only=production

COPY  /wait-for.sh /opt/wait-for.sh
COPY  /010_create_workspace.js /opt/010_create_workspace.js
COPY  /000_change_auth.js /opt/000_change_auth.js

RUN chmod +x /opt/wait-for.sh

CMD [ "./wait-for.sh", "geoserver:8080", "--", "npm", "start"]
