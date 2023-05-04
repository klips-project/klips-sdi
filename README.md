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

## COG Webspace

All COGs will finally be in the mount `cog_data` and not in the `mocked_webspace`. The latter is only for internal testing.
To COGs can be reached via <http://localhost/cog/>. The trailing `/` (slash) is important here, otherwise it does not work.

For pygeoapi it is important to that the files follow this naming pattern: `dresden_20221101T1000Z.tif`

An example directory could look like this:

```text
.
└── dresden
   └── dresden_temperature
      ├── dresden_20221101T1000Z.tif
      ├── dresden_20221102T1000Z.tif
      ├── dresden_20221103T1000Z.tif
      ├── dresden_20221104T1000Z.tif
      └── dresden_20221105T1000Z.tif
```

## Workflows

The directory `workflows` contains workflows that can be sent to the `dispatcher`.

## Send messages via command-line

For development it can be handy to send messages via the commandline using the tool `rabbitmqadmin`. There are some examples stored in `workflows`.

```bash
cat workflows/publish-geotiff.json | rabbitmqadmin -u rabbit -p rabbit publish exchange=amq.default routing_key=dispatcher
```

It can be downloaded either from your local RabbitMQ instance via: <http://localhost:15672/cli/rabbitmqadmin>

Or from GitHub via <https://raw.githubusercontent.com/rabbitmq/rabbitmq-server/v3.10.0/deps/rabbitmq_management/bin/rabbitmqadmin> - Make sure to select the version matching your RabbitMQ instance.

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
  -u=amqp://rabbit:rabbit@localhost:5672 \
  -r=dispatcher < workflows/publish-geotiff-with-validator.json
```

## Licence

BSD 2-Clause License (see LICENSE document)
