import { GeoServerRestClient } from 'geoserver-node-client';
import { log, initialize } from 'rabbitmq-worker/src/workerTemplate.js';
import fsPromises from 'fs/promises';

const url = process.env.GEOSERVER_REST_URL;
const user = process.env.GEOSERVER_USER;
const pw = process.env.GEOSERVER_PASSWORD;
const workerQueue = process.env.WORKERQUEUE;
const resultQueue = process.env.RESULTSQUEUE;
const rabbitHost = process.env.RABBITHOST;
const rabbitUser = process.env.RABBITUSER;
const rabbitPass = process.env.RABBITPASS;

const grc = new GeoServerRestClient(url, user, pw);

/**
 * Issues a project specific rollback.
 * Will delete corresponding datastore in geoserver if a geotiff has been published.
 * Will delete files that have been downloaded by the `download-file` worker.
 * @param {Object} workerJob The job object
 * @param {Array} inputs The inputs for this process
 * @example
 *   {
       "type": "rollback-handler",
       "inputs": [jobJson]
     }
 */
const rollback = async (workerJob, inputs) => {
  try {
    log("Starting rollback...");
    const json = inputs[0];
    const filesToDelete = [];
    for (let i = 0; i < json.job.length; i++) {
      const proc = json.job[i];
      if (proc.type.toLowerCase().indexOf('geoserver-publish-geotiff') > -1 &&
        proc.status && proc.status === 'success') {
          // unpublish tiff in geoserver
          const geoServerAvailable = await isGeoServerAvailable();
          if (!geoServerAvailable ){
            log('Geoserver not available');
            log('Job should be requeued!');
            workerJob.missingPreconditions = true;
            return;
          }
          const workspace = proc.inputs[0];
          const store = proc.inputs[1];
          await grc.datastores.deleteCoverageStore(workspace, store, true);
          log('Successfully deleted coverage store in GeoServer');
      } else if (proc.type.toLowerCase().indexOf('download-file') > -1 &&
          proc.outputs && proc.outputs[0]) {
          filesToDelete.push(proc.outputs[0]);
      }
    };
    for (let i = 0; i < filesToDelete.length; i++) {
      log(`Deleting file ${filesToDelete[i]} ...`)
      await fsPromises.rm(filesToDelete[i]);
      log('Successfully deleted file');
    };
  } catch(e) {
    log(`Exception on rollback: ${e}`);
  }
  workerJob.status = 'success';
  workerJob.outputs = [];
};

/**
 * Check if the GeoServer is running.
 *
 * @returns {Boolean} If the GeoServer is running.
 */
const isGeoServerAvailable = async () => {
  return await grc.about.exists();
}

// Initialize and start the worker process
initialize(rabbitHost, rabbitUser, rabbitPass, workerQueue, resultQueue, rollback, isGeoServerAvailable, 10);
