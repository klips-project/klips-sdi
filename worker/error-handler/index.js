import amqp from 'amqplib';
import { log } from '../workerTemplate.js';

const workerQueue = process.env.WORKERQUEUE;
const resultQueue = process.env.RESULTSQUEUE;
const rabbitHost = process.env.RABBITHOST;
const rabbitUser = process.env.RABBITUSER;
const rabbitPass = process.env.RABBITPASS;

let channel;

export async function initialize(
  rabbitHost,
  rabbitUser,
  rabbitPass,
  workerQueue,
  resultQueue
) {
  const connection = await amqp.connect({
    hostname: rabbitHost,
    username: rabbitUser,
    password: rabbitPass,
    heartbeat: 60
  });
  channel = await connection.createChannel();

  channel.assertQueue(workerQueue, {
    durable: true
  });

  log(`Worker waiting for messages in ${workerQueue}.`);
  channel.consume(
    workerQueue,
    async function (msg) {
      try {
        const job = JSON.parse(msg.content.toString());
        log('Received a failed job in dead letter queue ...');

        const mailSubject = 'KLIPS - Job processing failed';
        let mailMsg = `Processing of job with id ${job.id} failed.\n`;
        if (job.nextTask && job.nextTask.task) {
          mailMsg += `The process of type '${job.nextTask.task.type} failed `;
          mailMsg += `with the following error:\n\n`;
        } else {
          mailMsg += `The following error occured:\n\n`;
        }
        mailMsg += job.error;

        const emailJob = {
          "job": [
            {
              "id": 11,
              "type": "send-email",
              "inputs": [
                "weskamm@terrestris.de",
                mailSubject,
                mailMsg
              ]
            }
          ]
        };

        channel.sendToQueue(
          resultQueue,
          Buffer.from(JSON.stringify(emailJob)),
          {
            persistent: true
          }
        );
        log('Error handler worker finished');
      } catch (e) {
        console.error("Error parsing dead letter message", e);
      }
      channel.ack(msg);
    },
    {
      noAck: false
    }
  );
}

// Initialize and start the worker process
initialize(rabbitHost, rabbitUser, rabbitPass, workerQueue, resultQueue);
