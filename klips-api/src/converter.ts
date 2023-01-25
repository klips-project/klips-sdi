import { logger } from './logger';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import path from 'path';
import { GeoTiffPublicationJobOptions, JobConfig } from './types';

// we set Day.js to UTC mode, see https://day.js.org/docs/en/parse/utc
dayjs.extend(utc);

/**
 * Convert incoming message from API to an internal job for RabbitMQ.
 *
 * @param requestBody {Object} The JSON coming from the API
 * @param options {GeoTiffPublicationJobOptions} An object with options for the job creation
 *
 * @returns The job for the dispatcher
 */
const createGeoTiffPublicationJob = (requestBody: any,
  options: GeoTiffPublicationJobOptions
) => {
  const {
    minTimeStamp, maxTimeStamp, timeStampFormat, allowedEPSGCodes,
    allowedDataTypes, fileSize, regions, types, scenarios, expectedBandCount
  }: GeoTiffPublicationJobOptions
    = options;
  const regionNames = Object.keys(regions);

  const type: string = requestBody.payload.type;

  if (!type || !types.includes(type)) {
    throw 'Provided type is not known.';
  }

  const scenario: string = requestBody.payload.scenario;

  if (!scenario || !scenarios.includes(scenario)) {
    throw 'Provided scenario is not known.';
  }

  const regionName: string = requestBody.payload.region;

  if (!regionName || !regionNames.includes(regionName)) {
    throw 'Provided region is not known.';
  }
  const geoServerWorkspace = regionName;
  // NOTE: the store name must be unique, even between multiple workspaces
  const mosaicStoreName = `${regionName}_temperature`;

  const geotiffUrl = requestBody.payload.url;

  const parsedTimeStamp = dayjs(requestBody.payload.predictionStartTime);
  if (!parsedTimeStamp.isValid()) {
    throw 'TimeStamp not valid';
  }

  const inCorrectTimeRange = parsedTimeStamp.isAfter(minTimeStamp) && parsedTimeStamp.isBefore(maxTimeStamp);
  if (!inCorrectTimeRange) {
    throw 'Time outside of timerange';
  }

  const formattedTimestamp = parsedTimeStamp.utc().format(timeStampFormat);
  const fileName = `${requestBody.payload.region}_${formattedTimestamp}`;
  const fileNameWithSuffix = `${fileName}.tif`;

  const stagingDirectory = '/opt/staging/';
  const cogWebspaceBasePath = '/opt/cog/';
  const geoTiffFilePath = path.join(stagingDirectory, fileNameWithSuffix);

  const filePathOnWebspace = path.join(
    cogWebspaceBasePath,
    geoServerWorkspace,
    mosaicStoreName,
    fileNameWithSuffix
  );

  const fileUrlOnWebspace = `http://nginx/cog/${geoServerWorkspace}/${mosaicStoreName}/${fileNameWithSuffix}`;

  const email = requestBody.email;

  const replaceExistingGranule = true;

  // set username and password if necessary
  let username;
  let password;
  const partnerUrlStart = process.env.PARTNER_URL_START;
  if (geotiffUrl.startsWith(partnerUrlStart)) {
    logger.info('URL from partner is used');
    username = process.env.PARTNER_API_USERNAME;
    password = process.env.PARTNER_API_PASSWORD;
  }

  return {
    job: [
      {
        id: 1,
        type: 'download-file',
        inputs: [
          geotiffUrl,
          geoTiffFilePath,
          username,
          password
        ]
      },
      {
        id: 2,
        type: 'geotiff-validator',
        inputs: [
          {
            outputOfId: 1,
            outputIndex: 0
          },
          {
            extent: {
              allowedExtent: regions[regionName].bbox
            },
            projection: {
              allowedEPSGCodes: allowedEPSGCodes
            },
            dataType: {
              allowedDataTypes: allowedDataTypes
            },
            fileSize: fileSize,
            bands: {
              expectedCount: expectedBandCount
            }
          }
        ]
      },
      {
        id: 3,
        type: 'geotiff-optimizer',
        inputs: [
          {
            outputOfId: 2,
            outputIndex: 0
          },
          filePathOnWebspace
        ]
      },
      {
        id: 4,
        type: 'geoserver-create-imagemosaic-datastore',
        inputs: [
          geoServerWorkspace,
          mosaicStoreName,
          fileUrlOnWebspace
        ]
      },
      {
        id: 5,
        type: 'geoserver-publish-imagemosaic',
        inputs: [
          geoServerWorkspace,
          mosaicStoreName,
          fileUrlOnWebspace,
          replaceExistingGranule
        ]
      }
    ],
    email: email
  };
};

/**
 * Creates different jobs depending on the input message.
 *
 * @param requestBody {Object} The JSON coming from the API
 * @param jobConfig {Object} The options for the jobs
 *
 * @returns The job for the dispatcher
 */
const createJobFromApiInput = (requestBody: any, jobConfig: JobConfig) => {
  const geoTiffPublicationJob = jobConfig.geoTiffPublicationJob;

  return createGeoTiffPublicationJob(requestBody, geoTiffPublicationJob);
};

export default createJobFromApiInput;
