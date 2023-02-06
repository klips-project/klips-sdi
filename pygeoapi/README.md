# OGC API Processes with pygeoapi

Zonal statistics of a raster cropped by an provided GeoJSON polygon.

## Development

```shell
# update Docker file with included Python code
docker-compose up --build -d pygeoapi ; docker-compose logs -f

# lint using flake8
dev_scripts/lint.sh

# tests using py_test
dev_scripts/test.sh
```

## Logging

Logging from inside the process can be done using `LOGGER.error('your message')` or `LOGGER.debug('your message')`.

The logging level is defined in the file `pygeoapi-config.yml`.
