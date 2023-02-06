import express from 'express';
import helmet from 'helmet';
import amqp from 'amqplib';
import basicAuth from 'express-basic-auth';
import Ajv from 'ajv';
import fs from 'fs-extra';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { logger } from './logger';
import createJobFromApiInput from './converter';
import {
  urlencoded,
  json
} from 'body-parser';
import { JobConfig } from './types';

// global variables of this file
let port: any,
  useRabbitMQ: any,
  dispatcherQueue: string,
  rabbitHost: any,
  rabbitUser: any,
  rabbitPass: any,
  configDir,
  swaggerDocument: any,
  basicAuthUsersPath,
  basicAuthUsers: any,
  jsonSchemaGeoTiffPath,
  schemaInput: any,
  jobConfig: any,
  jobConfigPath,
  rabbitMqChannel: any;

/**
 * Main function that calls other functions.
 */
const main = async () => {
  collectConfiguration();
  startApi();
};

/**
 * Collects configurations and environment variables from various sources
 * and applies it to variables.
 */
const collectConfiguration = () => {
  port = process.env.PORT;
  if (!port || isNaN(port)) {
    logger.error('No port provided');
    process.exit(1);
  }

  useRabbitMQ = process.env.USE_RABBIT_MQ === '1';

  dispatcherQueue = process.env.DISPATCHERQUEUE as string;
  if (!dispatcherQueue) {
    logger.error('No dispatcher queue provided.');
    process.exit(1);
  }

  rabbitHost = process.env.RABBITHOST;
  if (!rabbitHost) {
    logger.error('No rabbitHost provided.');
    process.exit(1);
  }

  rabbitUser = process.env.RABBITUSER;
  if (!rabbitUser) {
    logger.error('No rabbitUser provided.');
    process.exit(1);
  }

  rabbitPass = process.env.RABBITPASS;
  if (!rabbitPass) {
    logger.error('No rabbitPass provided.');
    process.exit(1);
  }

  configDir = process.env.CONFIG_DIR || '/klips-conf';

  swaggerDocument = YAML.load(path.join(configDir, 'swagger.yaml'));

  basicAuthUsersPath = path.join(configDir, 'basic-auth-users.json');
  basicAuthUsers = fs.readJSONSync(basicAuthUsersPath);;

  jsonSchemaGeoTiffPath = path.join(configDir, 'schema-geotiff-upload.json');
  schemaInput = fs.readJSONSync(jsonSchemaGeoTiffPath);

  jobConfigPath = path.join(configDir, 'job-conf.json');
  jobConfig = fs.readJSONSync(jobConfigPath) as JobConfig;
};

/**
 * Starts the Express API and connects to RabbitMQ.
 */
const startApi = async () => {
  try {

    if (useRabbitMQ) {
      const connection = await amqp.connect({
        hostname: rabbitHost,
        username: rabbitUser,
        password: rabbitPass,
        heartbeat: 60
      });
      rabbitMqChannel = await connection.createChannel();

      rabbitMqChannel.assertQueue('DeadLetterQueue', { durable: true });
      rabbitMqChannel.bindQueue('DeadLetterQueue', 'DeadLetterExchange', '');
      rabbitMqChannel.assertQueue(dispatcherQueue, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'DeadLetterExchange'
        }
      });
    }

    const app = express();

    // See https://expressjs.com/en/guide/behind-proxies.html
    app.set('trust proxy', 1);

    // use basic security mechanisms
    app.use(helmet());

    // ensures the incoming data is a JSON
    app.use(json({
      limit: '1kb'
    }));
    app.use(urlencoded({
      extended: true
    }));


    var swaggerUiOptions = {
      // hide top toolbar
      customCss: '.swagger-ui .topbar { display: none };'
    };

    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(
      swaggerDocument,
      swaggerUiOptions
    ));

    app.listen(port);

    const routeStatus = '/api/status';
    const routeJob = '/api/job';

    app.use([routeJob, routeStatus], basicAuth({
      users: basicAuthUsers,
      realm: 'KLIPS', // name of the area to enter
      challenge: true
    }));

    app.get(
      routeStatus,
      getStatusHandler
    );

    app.post(
      routeJob,
      postJobHandler
    );

    logger.info(`Application successfully started on port ${port}`);
  } catch (error) {
    logger.error(`Could not start the application: ${error}`);
    return;
  }
};

/**
 * Returns a message if API is running.
 */
const getStatusHandler = async (req: express.Request, res: express.Response): Promise<express.Response> => {
  logger.debug('Received request about API status. Status: OK');
  return res.status(200).send({
    message: 'Status: active',
  });
};

/**
 * Handles incoming job.
 *
 * Validates incoming JSON.
 * If values are invalid, a feedback is sent to the user.
 * If values are valid, a job is send to RabbitMQ.
 */
const postJobHandler = async (req: express.Request, res: express.Response) => {
  const ajv = new Ajv();
  const validate = ajv.compile(schemaInput);
  // ensure a job can be created from the incoming JSON
  let job: any;
  try {
    job = createJobFromApiInput(req.body, jobConfig);
  } catch (error) {
    logger.error(
      { error: error, job: job, jsonSchema: schemaInput },
      'Creating a worker job from the API input failed.'
    );
  }

  if (validate(req.body) && job) {
    logger.debug({ job: job }, 'Received JSON with correct structure');
    if (useRabbitMQ) {
      if (job) {
        rabbitMqChannel.sendToQueue(dispatcherQueue, Buffer.from(JSON.stringify(
          job
        )), {
          persistent: true
        });
      }
    }
    res.send('Input valid. Requested job has been triggered.');
  } else if (validate(req.body) && !job) {
    const infoText = 'Submitted JSON has correct structure, but it contains invalid values.';
    logger.debug({ job: job, jsonSchema: schemaInput }, infoText);
    res.send(infoText);
  } else {
    logger.debug(
      { validationErrors: validate.errors, job: job, jsonSchema: schemaInput },
      'Input data not in correct Structure'
    );
    const errorReport = JSON.stringify(validate.errors, null, 2);

    // message to client
    res.send(`Submitted JSON is malformed. Errors:\n ${errorReport}`);
  }
};

main();
