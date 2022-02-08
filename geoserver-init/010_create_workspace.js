import GeoServerRestClient from 'geoserver-node-client';

const geoserverUrl = process.env.GEOSERVER_REST_URL;

const geoserverDefaultUser = process.env.GEOSERVER_DEFAULT_USER;
const geoserverDefaultPw = process.env.GEOSERVER_DEFAULT_PASSWORD;

const workspaceOverlay = 'klips';
const workspaceOverLayUri = 'https://www.meggsimum.de/namespace/klips';

/**
 * Main function
 */
async function initGeoserver () {
  await createWorkspaces();
}

/**
 * Create the workspaces.
 */
async function createWorkspaces () {
  console.log();
  console.log('### WORKSPACES ###');
  console.log();

  const wsOverLayerExists = await grc.namespaces.get(workspaceOverlay);
  if (wsOverLayerExists) {
    console.log(`INFO: workspace '${workspaceOverlay}' already exists'`);
  } else {
    const workspaceOverlayCreated = await grc.namespaces.create(workspaceOverlay, workspaceOverLayUri);
    if (workspaceOverlayCreated) {
      console.log(`SUCCESS: Created Workspace: '${workspaceOverlay}'`);
    } else {
      console.error(`ERROR: Creation of Workspace failed '${workspaceOverlay}'`);
    }
  }
}

// check if we can connect to GeoServer REST API
const grc = new GeoServerRestClient(geoserverUrl, geoserverDefaultUser, geoserverDefaultPw);
grc.exists().then(gsExists => {
  if (gsExists === true) {
    initGeoserver();
  } else {
    console.error('ERROR: Could not connect to GeoServer REST API - ABORT!');
  }
});
