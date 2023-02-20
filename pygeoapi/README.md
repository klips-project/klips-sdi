# OGC API Processes with pygeoapi

Zonal statistics of a raster cropped by an provided GeoJSON polygon.

## File structure

- The directory `processes` will copied during the Docker build process to the correct path in the parent `pygeoapi` project.

- The Python files on the top level of the `processes` directory represent the processes that `pygeoapi` exposes to the public. They need to implement predefined methods to be valid. They also have to be referenced in the configuration file `pygeoapi-config.yml`.

- The directory `algorithms` contains Python files that implement the main business logic of the processes. They files in `algorithms` are executable **without** `pygeoapi`, hence they can be developed on the local computer without starting the main `pygeoapi` Docker container.

## Development

```shell
# update Docker file with included Python code
docker-compose up --build -d pygeoapi ; docker-compose logs -f

# lint using flake8
dev_scripts/lint.sh
```

## Tests

The tests require a mocked webserver containing dummy COGs. It is included in the top-level docker-compose setup by the `nginx` service. Run it like this:

```shell
# navigate to the root of the top-level project 'klips-sdi'
cd ..
# start the nginx service
docker-compose -f docker-compose.yml up nginx
```

In a different terminal navigate to the directory of `pygeoapi`:

```shell
# run tests using py_test
dev_scripts/test.sh
```

## Logging

Logging from inside the process can be done using `LOGGER.error('your message')` or `LOGGER.debug('your message')`.

The logging level is defined in the file `pygeoapi-config.yml`.
