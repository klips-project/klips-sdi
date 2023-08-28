import {
  GeoServerRestClient
} from 'geoserver-node-client';
import fs from 'fs';
import path from 'path';
import {
  logger
} from './logger.js';
import {
  geoserverUrl,
  geoserverUser,
  geoserverPw,
  genericWorkspace,
  workspaces
} from './constants.js'

// constants
const SLD_SUFFIX = '.sld';
const SLD_DIRECTORY = 'sld';

// check if we can connect to GeoServer REST API
const grc = new GeoServerRestClient(geoserverUrl, geoserverUser, geoserverPw);

async function main() {
  await createWorkspaces();
  await createStyles();
}

/**
 * Create the workspaces.
 */
async function createWorkspaces() {
  logger.info('Start creating workspaces');

  for (const workspace of workspaces) {
    const wsOverLayerExists = await grc.namespaces.get(workspace);
    const workspaceOverLayUri = `https://www.meggsimum.de/namespace/klips/${workspace}`;

    if (wsOverLayerExists) {
      logger.info(`Workspace '${workspace}' already exists`);
    } else {
      try {
        logger.info(`Created Workspace: '${workspace}'`);
        await grc.namespaces.create(workspace, workspaceOverLayUri);
      } catch (error) {
        logger.error(error);
      }
    }
  }
}

/**
 * Loops over all files of the SLD directory and publishes them to GeoServer.
 */
async function createStyles() {
  logger.info('Start creating styles')
  const sldFiles = await fs.readdirSync(SLD_DIRECTORY);

  // loop over SLD files
  for (const file of sldFiles) {
    const styleName = path.parse(file).name;
    const extension = path.parse(file).ext;

    if (extension !== SLD_SUFFIX) {
      // skip files that are not SLD
      return;
    }
    await createSingleStyle(genericWorkspace, styleName);
  }
}

/**
 * Reads a SLD file and publishes it to GeoServer.
 *
 * We assume the name of the file without extension is the name of the style.
 *
 * @param {String} workspace The workspace to publish the style to
 * @param {String} styleName The name of the style and the file
 */
async function createSingleStyle(workspace, styleName) {
  logger.info(`Creating style '${styleName}' ... `);
  const styleFile = styleName + SLD_SUFFIX;

  const styleExists = await grc.styles.getStyleInformation(workspace, styleName);

  if (styleExists) {
    logger.info(`Style '${styleName}' already exists`);
  } else {
    const sldFilePath = path.join(SLD_DIRECTORY, styleFile);
    const sldBody = fs.readFileSync(sldFilePath, 'utf8');

    // publish style
    await grc.styles.publish(workspace, styleName, sldBody);
    logger.info(`Successfully created style '${styleName}'`);
  }
}

main();
