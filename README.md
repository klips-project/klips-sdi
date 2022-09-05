# KLIPS Spatial Data Infrastructure

The spatial data infrastructure for the [KLIPS project](http://www.klips-projekt.de/).

## Setup

```shell
# create your personal environment variables config
cp .env.example .env

# create your personal klips api config
mkdir klips-api-config
cp klips-api-config-example/* klips-api-config/

# start the containers
docker-compose up

# download latest images if they have changed
docker-compose pull
```

## Workflows

The directory `workflows` contains workflows that can be sent to the `dispatcher`:

- `publish-geotiff.json` downloads a GeoTIFF and publishes it as layer in GeoServer

## Send messages via command-line

For development it can be handy to send messages via the commandline using the tool `rabbitmqadmin`:

```bash
cat workflows/publish-geotiff.json | rabbitmqadmin -u rabbit -p rabbit publish exchange=amq.default routing_key=dispatcher
```

It can be downloaded either from your local RabbitMQ instance via: http://localhost:15672/cli/rabbitmqadmin

Or from GitHub via https://raw.githubusercontent.com/rabbitmq/rabbitmq-server/v3.10.0/deps/rabbitmq_management/bin/rabbitmqadmin - Make sure to select the version matching your RabbitMQ instance.

Make the programm executable via:

```shell
chmod +x /your/path/to/rabbitmqadmin
```

Alternatively, you can `apt install amqp-tools` and then run jobs like this:

```
amqp-publish -u=amqp://rabbit:rabbit@localhost:5672 -r=dispatcher < workflows/publish-geotiff-with-validator.json
```
