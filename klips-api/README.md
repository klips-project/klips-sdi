# KLIPS API

The API for the KLIPS project.

## Development

with local Node.js:

```shell
# install dependencies
npm i

# run with hot-reload
npm run watch

# create a local build
npm run build
```

using Node.js inside Docker:

```shell
# build image
docker build \
  --file Dockerfile.dev \
  --tag klips-api-dev \
  .

# run image with mounted source code
docker run  \
  -p 3000:3000 \
  -v $(pwd):/usr/app \
  -v $(pwd)/../configs-example:/klips-conf \
  --env-file docker.env \
  klips-api-dev

## build the production image
docker build --tag klips-api .
```

## Environment variables

- `USE_RABBIT_MQ` - if API shall forward messages to RabbitMQ. Allowed values: `0`, `1`. Default is `0`
- `PORT` -  The Port on which to publish this API
- `DISPATCHERQUEUE` - the name of the dispatcher queue
- `RABBITHOST` - the host of the RabbitMQ instance
- `RABBITUSER` - the username for the RabbitMQ instance
- `RABBITPASS` - the password for the RabbitMQ instance
- `CONFIG_DIR` - the path to the directory with the configuration files
- `PARTNER_URL_START` - the start string of the partner's API URL, e.g. "https://www.example.com/api"
- `PARTNER_API_USERNAME` - the username of the partner's API
- `PARTNER_API_PASSWORD` - the password of the partner's API

## Config files

The API has these config files:

- `basic-auth-users.json`: the credentials for basic authentication
- `schema-geotiff-upload.json`: the JSON schema for validating the API input
- `job-conf.json`: options for each job that shall be send to RabbitMQ
- `swagger.yaml`: The swagger configuration for the API

## Usage

API starts on port `3000` with these endpoints:

- `GET /status`
- `POST /job`

## Access with CLI

```shell
curl \
--request POST \
--user klips:klips \
--header 'Content-Type: application/json' \
--data @example_requests/send-geotiff-dresden.json \
'http://localhost:3000/api/job'
```

## Monitoring Script

The script in `api-monitor` can be used to regularly check if the API is running.
