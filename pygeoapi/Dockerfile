FROM geopython/pygeoapi:0.13.0

RUN apt -y update && \
    apt -y upgrade && \
    apt -y install grass \
                   gdal-bin

# install 'rasterstats', 'click' needed for compatibility with pygeoapi
RUN pip3 install rasterstats click==7.1.2

COPY demo_data/ /demo_data/

WORKDIR /pygeoapi
COPY pygeoapi-config.yml local.config.yml
COPY processes/ processes/
