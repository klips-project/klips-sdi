import { GeoServerRestClient } from 'geoserver-node-client';

const geoserverUrl = process.env.GEOSERVER_REST_URL;

const geoserverUser = process.env.GEOSERVER_USER;
const geoserverPw = process.env.GEOSERVER_PASSWORD;

const workspaceOverlay = 'klips';
const workspaceOverLayUri = 'https://www.meggsimum.de/namespace/klips';

// check if we can connect to GeoServer REST API
const grc = new GeoServerRestClient(geoserverUrl, geoserverUser, geoserverPw);
grc.about.exists()
  .then(() => {
    createWorkspaces();
  })
  .catch(() => {
    console.error('ERROR:', 'Could not connect to GeoServer REST API - ABORT!');
  });

/**
 * Create the workspaces.
 */
async function createWorkspaces () {
  console.log();
  console.log('### WORKSPACES ###');
  console.log();

  const wsOverLayerExists = await grc.namespaces.get(workspaceOverlay);
  if (wsOverLayerExists) {
    console.log(`INFO: Workspace '${workspaceOverlay}' already exists.`);
  } else {
    try {
      console.log(`SUCCESS: Created Workspace: '${workspaceOverlay}'`);
      await grc.namespaces.create(workspaceOverlay, workspaceOverLayUri);
    } catch (error) {
      console.error('ERROR', error);
    }
  }
}
