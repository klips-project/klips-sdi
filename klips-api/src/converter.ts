import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import path from 'path';
import { logger } from './logger';
import { GeoTiffPublicationJobOptions, JobConfig } from './types';

// we set Day.js to UTC mode, see https://day.js.org/docs/en/parse/utc
dayjs.extend(utc);

/**
 * Convert incoming message from API to an internal job for RabbitMQ.
 *
 * @param requestBody The JSON coming from the API
 * @param options An object with options for the job creation
 *
 * @returns The job for the dispatcher
 */
const createGeoTiffPublicationJob = (requestBody: any,
  options: GeoTiffPublicationJobOptions
) => {
  const {
    minTimeStamp, maxTimeStamp, timeStampFormat, allowedEPSGCodes,
    allowedDataTypes, fileSize, regions, scenarios, expectedBandCount, expectedNoDataValue, valueRange
  }: GeoTiffPublicationJobOptions
    = options;
  const regionNames = Object.keys(regions);
  const payload = requestBody.payload;

  const scenario: string = payload.scenario;
  if (!scenario || !scenarios.includes(scenario)) {
    const errorText = 'Provided scenario is not known.';
    logger.error({ scenario: scenario, requestBody: requestBody }, errorText);
    throw errorText;
  }

  const regionName: string = payload.region;
  if (!regionName || !regionNames.includes(regionName)) {
    const errorText = 'Provided region is not known.';
    logger.error({ regionName: regionName, requestBody: requestBody }, errorText);
    throw errorText;
  }

  const geoServerWorkspace = regionName;
  // NOTE: the store name must be unique, even between multiple workspaces
  const mosaicStoreName = `${regionName}_temperature`;

  const geotiffUrl = payload.url;

  const parsedTimeStamp = dayjs(payload.predictionStartTime);
  if (!parsedTimeStamp.isValid()) {
    const errorText = 'TimeStamp not valid';
    logger.error({ parsedTimeStamp: parsedTimeStamp, requestBody: requestBody }, errorText);
    throw errorText;
  }

  const inCorrectTimeRange = parsedTimeStamp.isAfter(minTimeStamp) && parsedTimeStamp.isBefore(maxTimeStamp);
  if (!inCorrectTimeRange) {
    const errorText = 'Time outside of timerange';
    logger.error({ requestBody: requestBody }, errorText);
    throw errorText;
  }

  const formattedTimestamp = parsedTimeStamp.utc().format(timeStampFormat);
  const fileName = `${payload.region}_${formattedTimestamp}`;
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
    logger.debug({ url: geotiffUrl }, 'URL from partner is used');
    username = process.env.PARTNER_API_USERNAME;
    password = process.env.PARTNER_API_PASSWORD;
  }

  const job = {
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
            bandCount: {
              expectedCount: expectedBandCount
            },
            noDataValue: {
              expectedValue: expectedNoDataValue
            },
            valueRange: valueRange
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

  logger.info('Successfully created job');
  logger.debug({ job: job });

  return job;
};

/**
 * Creates different jobs depending on the input message.
 *
 * @param requestBody The JSON coming from the API
 * @param jobConfig The options for the jobs
 *
 * @returns The job for the dispatcher
 */
const createJobFromApiInput = (requestBody: any, jobConfig: JobConfig) => {
  const geoTiffPublicationJob = jobConfig.geoTiffPublicationJob;

  return createGeoTiffPublicationJob(requestBody, geoTiffPublicationJob);
};

export default createJobFromApiInput;
