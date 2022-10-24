FROM geopython/pygeoapi:0.12.0

RUN apt -y update && \
    apt -y upgrade && \
    apt -y install grass \
                   gdal-bin

COPY pygeoapi-config.yml /pygeoapi/local.config.yml
COPY processes /pygeoapi/processes
COPY process_scripts/ /process_scripts/
COPY demo_data/ /demo_data/
