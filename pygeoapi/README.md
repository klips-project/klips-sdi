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

### Debugging

1. Set env variable `DEBUG=True` and add port mapping for `5678` for the `pygeoapi` service in the `docker-compose.yml` file.
2. Add a vscode debug configuration file (`klips-sdi/pygeoapi/.vscode/launch.json`):
```
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Remoteanfügung",
            "type": "python",
            "request": "attach",
            "connect": {
                "host": "127.0.0.1",
                "port": 5678
            },
            "pathMappings": [
                {
                    "localRoot": "${workspaceFolder}/processes",
                    "remoteRoot": "/pygeoapi/processes"
                }
            ],
            "justMyCode": false
        }
    ]
}
```
3. Restart the docker container. Press `F5` in VSCode to connect the debugger.

Furthermore, the log level can be changed to DEBUG in `pygeoapi-config.yml`.

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
