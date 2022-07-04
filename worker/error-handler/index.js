import amqp from 'amqplib';

const workerQueue = process.env.WORKERQUEUE;
const resultQueue = process.env.RESULTSQUEUE;
const rabbitHost = process.env.RABBITHOST;
const rabbitUser = process.env.RABBITUSER;
const rabbitPass = process.env.RABBITPASS;
const dev = process.env.DEV_MODE === "1";

let channel;

/**
 * This worker handles errors that may appear in the specific workflows the dispatcher handles.
 * If a worker throws an error, this worker will pick up that message / job information
 * from the dead letter queue in order to trigger mail, chat messages and cleanups.
 */
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

  console.log(`Worker waiting for messages in ${workerQueue}.`);
  channel.consume(
    workerQueue,
    async function (msg) {
      try {
        const job = JSON.parse(msg.content.toString());
        console.log('Received a failed job in dead letter queue ...');

        // Handling different recipients based on failed instance
        // External failure: failures in validators -> mail to original job sender; POST message to chat
        // Internal failure: failures after validators -> POST message to chat
        const failedTask = job.nextTask?.task?.type;
        let mailRecipients;
        // Check if a worker / task has failed which contains `validator` in its name.
        // If so, we will send an email the original job sender
        if (failedTask && failedTask.toLowerCase().indexOf('validator') > -1) {
          mailRecipients = job.email;
        }

        const subject = 'KLIPS - Job processing failed';
        let content = `Processing of job with id ${job.id} failed.\n`;
        if (failedTask) {
          content += `The process of type '${failedTask}' failed `;
          content += `with the following error:\n\n`;
        } else {
          content += `The following error occurred:\n\n`;
        }
        content += job.error + '\n\n';
        content += 'The complete job output is listed below:\n\n';

        if (mailRecipients) {
          const emailJob = {
            "job": [
              {
                "id": 1,
                "type": "send-email",
                "inputs": [
                  mailRecipients,
                  subject,
                  content + msg.content.toString()
                ]
              }
            ]
          };
          if (dev) {
            console.log(`DEV: Usually a job for email notification would be triggered here, but omitted because of development mode.` );
          } else {
            channel.sendToQueue(
              resultQueue,
              Buffer.from(JSON.stringify(emailJob)),
              {
                persistent: true
              }
            );
            console.log('Email job dispatched from error handler');
          }
        }
        const mattermostJob = {
          "job": [
            {
              "id": 2,
              "type": "send-mattermost-message",
              "inputs": [
                content + '```' + msg.content.toString() + '```\n' +
                '@jakob @weskamm @hblitza @uli'
              ]
            }
          ]
        };
        if (dev) {
          console.log(`DEV: Usually a job for chat notification would be triggered here, but omitted because of development mode.` );
        } else {
          channel.sendToQueue(
            resultQueue,
            Buffer.from(JSON.stringify(mattermostJob)),
            {
              persistent: true
            }
          );
        }
        console.log('Mattermost message job dispatched from error handler');
        console.log('Error handler worker finished');
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
