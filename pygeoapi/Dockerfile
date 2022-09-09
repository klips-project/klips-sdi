FROM geopython/pygeoapi:0.12.0

RUN apt -y update && \
    apt -y upgrade && \
    apt -y install grass

COPY pygeoapi-config.yml /pygeoapi/local.config.yml
COPY processes /pygeoapi/processes
