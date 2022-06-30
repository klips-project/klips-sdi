import { log, initialize } from 'rabbitmq-worker/src/workerTemplate.js';
import fsPromises from 'fs/promises';

const workerQueue = process.env.WORKERQUEUE;
const resultQueue = process.env.RESULTSQUEUE;
const rabbitHost = process.env.RABBITHOST;
const rabbitUser = process.env.RABBITUSER;
const rabbitPass = process.env.RABBITPASS;

/**
 * Issues a project specific rollback.
 * @param {Object} workerJob The job object
 * @param {Array} inputs The inputs for this process
 * @example
 *   {
       "type": "rollback-handler",
       "inputs": [job]
     }
 */
const rollback = async (workerJob, inputs) => {
  console.log("workerjob", workerJob);
  console.log("inputs", inputs);

  const job = inputs[0];
  const filesToDelete = [];
  job.forEach(proc => {
    if (proc.type.toLowerCase().indexOf('geoserver-publish-geotiff') > -1 &&
      proc.status && proc.status === 'success') {
      // TODO: unpublish tiff in geoserver
    } else if (proc.type.toLowerCase().indexOf('download') > -1 &&
        proc.outputs && proc.outputs[0]) {
        filesToDelete.push(proc.outputs[0]);
    }
  });
  filesToDelete.forEach(async(file) => {
    await fsPromises.delete(file);
    log('Successfully deleted a file in rollback handler');
  });

  workerJob.status = 'success';
  workerJob.outputs = [];
};

// Initialize and start the worker process
initialize(rabbitHost, rabbitUser, rabbitPass, workerQueue, resultQueue, rollback);
