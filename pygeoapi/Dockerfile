FROM geopython/pygeoapi:0.12.0

RUN apt -y update && \
    apt -y upgrade && \
    apt -y install grass \
                   gdal-bin

# install 'rasterstats', 'click' needed for compatibility with pygeoapi
RUN pip3 install rasterstats click==7.1.2

COPY pygeoapi-config.yml /pygeoapi/local.config.yml
COPY processes /pygeoapi/processes
COPY process_scripts/ /process_scripts/
COPY demo_data/ /demo_data/
