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
grc.about.exists()
  .then(async () => {
    await createWorkspaces();
    await createStyles();
  })
  .catch(() => {
    console.error('ERROR:', 'Could not connect to GeoServer REST API - ABORT!');
  });

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
  const sldFiles = await fs.readdirSync(SLD_DIRECTORY);

  // loop over SLD files
  await asyncForEach(sldFiles, async file => {
    const styleName = path.parse(file).name;
    const extension = path.parse(file).ext;

    if (extension !== SLD_SUFFIX) {
      // skip files that are not SLD
      return;
    }
    await createSingleStyle(styleName, genericWorkspace);
  });
}

/**
 * Reads a SLD file and publishes it to GeoServer.
 *
 * We assume the name of the file without extension is the name of the style.
 *
 * @param {String} styleName The name of the style and the file
 * @param {String} workspace The workspace to publish the style to
 */
async function createSingleStyle(styleName, workspace) {
  console.log(`Creating style '${styleName}' ... `);
  const styleFile = styleName + SLD_SUFFIX;

  const styleExists = await grc.styles.getStyleInformation(styleName, workspace);

  if (styleExists) {
    console.log('Style already exists. SKIP');
  } else {
    const sldFilePath = path.join(SLD_DIRECTORY, styleFile);
    const sldBody = fs.readFileSync(sldFilePath, 'utf8');

    // publish style
    await grc.styles.publish(workspace, styleName, sldBody);
    console.log(`Successfully created style '${styleName}'`);
  }
}

/**
 * Helper to perform asynchronous forEach.
 * Found at https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
 *
 * @param {*[]} array
 * @param {Function} callback
 */
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
