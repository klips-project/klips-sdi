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

## Usage

Example request:

```shell
curl 'http://localhost:5000/processes/zonal-statistics-grass/execution' \
   -X POST \
   -H 'content-type: application/json'  \
   --data-raw '{
    "inputs": {
        "inputGeometries": [
            {
                "value": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                13.740481048705242,
                                51.07277038077021
                            ],
                            [
                                13.731125503661298,
                                51.069210848003564
                            ],
                            [
                                13.743141800048015,
                                51.06489589578095
                            ],
                            [
                                13.740481048705242,
                                51.07277038077021
                            ]
                        ]
                    ]
                },
                "mediaType": "application/geo+json"
            }
        ]
    }
}'

```
