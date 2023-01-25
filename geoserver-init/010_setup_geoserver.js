import { GeoServerRestClient } from 'geoserver-node-client';
import fs from 'fs';
import path from 'path';

const geoserverUrl = process.env.GEOSERVER_REST_URL;

const geoserverUser = process.env.GEOSERVER_USER;
const geoserverPw = process.env.GEOSERVER_PASSWORD;

/** Workspace for generic objects like styles */
const genericWorkspace = 'klips';

const workspaces = ['dresden', 'langenfeld', genericWorkspace];

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
  console.log();
  console.log('### WORKSPACES ###');
  console.log();

  for (const workspace of workspaces) {
    const wsOverLayerExists = await grc.namespaces.get(workspace);
    const workspaceOverLayUri = `https://www.meggsimum.de/namespace/klips/${workspace}`;

    if (wsOverLayerExists) {
      console.log(`INFO: Workspace '${workspace}' already exists.`);
    } else {
      try {
        console.log(`SUCCESS: Created Workspace: '${workspace}'`);
        await grc.namespaces.create(workspace, workspaceOverLayUri);
      } catch (error) {
        console.error('ERROR', error);
      }
    }
  }
}

/**
 * Loops over all files of the SLD directory and publishes them to GeoServer.
 */
async function createStyles() {
  console.log();
  console.log('### STYLES ###');
  console.log();
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
  console.log('INFO', `Creating style '${styleName}' ... `);
  const styleFile = styleName + SLD_SUFFIX;

  const styleExists = await grc.styles.getStyleInformation(workspace, styleName);

  if (styleExists) {
    console.log('INFO', `Style '${styleName}' already exists.`);
  } else {
    const sldFilePath = path.join(SLD_DIRECTORY, styleFile);
    const sldBody = fs.readFileSync(sldFilePath, 'utf8');

    // publish style
    await grc.styles.publish(workspace, styleName, sldBody);
    console.log('INFO', `Successfully created style '${styleName}'`);
  }
}

main();
