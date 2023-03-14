FROM geopython/pygeoapi:0.14.0

# add ubuntugis repository for latest GRASS version
RUN apt -y update && \
    apt -y install software-properties-common && \
    add-apt-repository ppa:ubuntugis/ubuntugis-unstable && \
    apt -y update && \
    apt -y upgrade

RUN apt -y install grass gdal-bin

# NOTE: ensure the minor versions of added libraries are compatible with each other,
#       otherwise pygeoapi might not start up at all

# install 'rasterstats' for zonal statistics, 'click' needed for compatibility with pygeoapi
RUN pip3 install rasterstats click==7.1.2 rio-cogeo==3.4.1 shapely==2.0.1

# install 'rio-cogeo' to query information about COG
RUN pip3 install rio-cogeo==3.4.1

COPY demo_data/ /demo_data/

WORKDIR /pygeoapi
COPY pygeoapi-config.yml local.config.yml
COPY processes/ processes/
