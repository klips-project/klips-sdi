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

const port: any = process.env.PORT;
if (!port || isNaN(port)) {
  logger.error('No port provided');
  process.exit(1);
}

const useRabbitMQ = process.env.USE_RABBIT_MQ === '1';
const dispatcherQueue: string = process.env.DISPATCHERQUEUE as string;
const rabbitHost = process.env.RABBITHOST;
const rabbitUser = process.env.RABBITUSER;
const rabbitPass = process.env.RABBITPASS;

const configDir = process.env.CONFIG_DIR || '/klips-conf';

const swaggerDocument = YAML.load(path.join(configDir, 'swagger.yaml'));

const basicAuthUsersPath = path.join(configDir, 'basic-auth-users.json');
const basicAuthUsers = fs.readJSONSync(basicAuthUsersPath);;

const jsonSchemaGeoTiffPath = path.join(configDir, 'schema-geotiff-upload.json');
const schemaInput = fs.readJSONSync(jsonSchemaGeoTiffPath);

const jobConfigPath = path.join(configDir, 'job-conf.json');
const jobConfig = fs.readJSONSync(jobConfigPath) as JobConfig;

const main = async () => {

  try {

    let channel: any;
    if (useRabbitMQ) {
      const connection = await amqp.connect({
        hostname: rabbitHost,
        username: rabbitUser,
        password: rabbitPass,
        heartbeat: 60
      });
      channel = await connection.createChannel();

      channel.assertQueue('DeadLetterQueue', { durable: true });
      channel.bindQueue('DeadLetterQueue', 'DeadLetterExchange', '');
      channel.assertQueue(dispatcherQueue, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'DeadLetterExchange'
        }
      });
    }

    const app = express();

    // See https://expressjs.com/en/guide/behind-proxies.html
    app.set('trust proxy', 1);

    app.use(helmet());

    // ensures the incoming data is a JSON
    app.use(json({
      limit: '1kb'
    }));
    app.use(urlencoded({
      extended: true
    }));


    var options = {
      // hide top toolbar
      customCss: '.swagger-ui .topbar { display: none };'
    };

    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(
      swaggerDocument,
      options
    ));

    app.listen(port);

    const routeJob = '/api/job';
    const routeStatus = '/api/status';

    app.use([routeJob, routeStatus], basicAuth({
      users: basicAuthUsers,
      realm: 'KLIPS', // name of the area to enter
      challenge: true
    }));

    app.get(
      routeStatus,
      async (req: express.Request, res: express.Response): Promise<express.Response> => {
        logger.info('status active');
        return res.status(200).send({
          message: 'Status: active',
        });
      }
    );

    app.post(
      routeJob,
      async (req: express.Request, res: express.Response) => {

        const ajv = new Ajv();
        const validate = ajv.compile(schemaInput);
        // ensure a job can be created from the incoming JSON
        let job: any;
        try {
          job = createJobFromApiInput(req.body, jobConfig);
        } catch (error) {
          logger.error(error);
        }

        if (validate(req.body) && job) {
          logger.info('Input data is in correct structure');
          logger.info(`Job:\n ${JSON.stringify(job, null, 2)}`);

          if (useRabbitMQ) {
            if (job) {
              channel.sendToQueue(dispatcherQueue, Buffer.from(JSON.stringify(
                job
              )), {
                persistent: true
              });
            }
          }
          res.send('Submitted JSON has correct structure');
        } else if (validate(req.body) && !job) {
          const infoText = 'Submitted JSON has correct structure, but it contains invalid values.';
          logger.info(infoText);
          res.send(infoText);
        } else {
          logger.error('Input data not in correct Structure');
          // log the problems of the incoming JSON
          logger.error(validate.errors);
          const errorReport = JSON.stringify(validate.errors, null, 2);

          // message to client
          res.send(`Submitted JSON is malformed. Errors:\n ${errorReport}`);
        }
      });

    logger.info(`🍻 Application successfully started on port ${port}`);
  } catch (error) {
    logger.error(`🔥 Could not start the application: ${error}`);
    return;
  }
};

main();
