FROM node:16-alpine

COPY  /package.json /opt/package.json

WORKDIR /opt
RUN npm install --only=production

COPY  wait-for.sh wait-for.sh
COPY  010_setup_geoserver.js 010_setup_geoserver.js.js
COPY  000_change_auth.js 000_change_auth.js
COPY  sld/ sld/
COPY  logger.js logger.js

RUN ls

RUN chmod +x /opt/wait-for.sh

CMD [ "./wait-for.sh", "--timeout=180", "geoserver:8080", "--", "npm", "start"]
