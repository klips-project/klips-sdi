FROM node:alpine

COPY  /package.json /opt/package.json

WORKDIR /opt
RUN npm install --only=production

COPY  /wait-for.sh /opt/wait-for.sh
COPY  /010_setup_geoserver.js /opt/010_setup_geoserver.js.js
COPY  /000_change_auth.js /opt/000_change_auth.js
COPY  /sld/ /opt/sld/

RUN chmod +x /opt/wait-for.sh

CMD [ "./wait-for.sh", "--timeout=180", "geoserver:8080", "--", "npm", "start"]
