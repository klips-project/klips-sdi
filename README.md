# KLIPS Spatial Data Infrastructure

The spatial data infrastructure for the [KLIPS project](http://www.klips-projekt.de/).

## Setup

create custom configuration:

```shell
# create your personal environment variables config
cp .env.example .env

# create your personal set of config files
cp configs-example/* configs/
```

development:

```shell
# expects the referenced repo located next to this directory
docker-compose up --build
```

production:

```shell
# download latest images if they have changed
docker-compose -f docker-compose.yml pull

docker-compose -f docker-compose.yml up
```

Before using the stores for Dresden and Langenfeld they need to be initalized with sample COG files.

**IMPORTANT** Adapt the username and the password if you are on production!

```shell
# Langenfeld
curl \
--request POST \
--user klips:klips \
--header 'Content-Type: application/json' \
--data @klips-api/example_requests/send-geotiff-langenfeld.json \
'http://localhost:3000/api/job'

# Dresden
curl \
--request POST \
--user klips:klips \
--header 'Content-Type: application/json' \
--data @klips-api/example_requests/send-geotiff-dresden.json \
'http://localhost:3000/api/job'
```

## Workflows

The directory `workflows` contains workflows that can be sent to the `dispatcher` using `amqp-publish` (installation: `apt install amqp-tools`)

```shell
amqp-publish \
  -u=amqp://klips:klips@localhost:5672 \
  -r=dispatcher < workflows/publish-geotiff-with-validator.json
```
