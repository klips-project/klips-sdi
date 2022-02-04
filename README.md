# KLIPS Spatial Data Infrastructure

The spatial data infrastructure for the [KLIPS project](http://www.klips-projekt.de/).

## Setup

```shell
# create your personal config
cp .env.example .env

# start the containers
docker-compose up

# download latest images if they have changed
docker-compose pull
```

## Workflows

The directory `workflows` contains workflows that can be send to the `dispatcher`:

- `publish-geotiff.json` downloads a GeoTIFF and publishes it as layer in GeoServer
