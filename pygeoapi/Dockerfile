FROM geopython/pygeoapi:0.14.0

# add ubuntugis repository for latest GRASS version
RUN apt -y update && \
    apt -y install software-properties-common && \
    add-apt-repository ppa:ubuntugis/ubuntugis-unstable && \
    apt -y update && \
    apt-mark hold python3-mapscript && \
    apt -y upgrade && \
    apt -y install grass gdal-bin ffmpeg

# NOTE: ensure the minor versions of added libraries are compatible with each other,
#       otherwise pygeoapi might not start up at all

RUN pip3 install rasterstats click==7.1.2 rio-cogeo==3.4.1 shapely==2.0.1 ffmpeg-python==0.2.0 Pillow==9.4.0 pygml==0.2.2 lxml==4.9.2 debugpy==1.6.7 pytz==2023.3.post1requests==2.31.0 

COPY demo_data/ /demo_data/

WORKDIR /pygeoapi
COPY pygeoapi-config.yml local.config.yml
COPY processes/ processes/
COPY entry.py .

ENTRYPOINT [ "python3", "entry.py" ]
