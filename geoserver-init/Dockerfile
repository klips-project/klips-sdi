FROM node:16-alpine

COPY  /package.json /home/package.json

WORKDIR /home
RUN npm install --only=production

COPY  wait-for.sh wait-for.sh
COPY  010_setup_geoserver.js 010_setup_geoserver.js.js
COPY  000_change_auth.js 000_change_auth.js
COPY  020_add_metadata.js 020_add_metadata.js
COPY  constants.js constants.js
COPY  sld/ sld/
COPY  logger.js logger.js
COPY  util.js util.js

RUN chmod +x /home/wait-for.sh

CMD [ "./wait-for.sh", "--timeout=180", "geoserver:8080", "--", "npm", "start"]
