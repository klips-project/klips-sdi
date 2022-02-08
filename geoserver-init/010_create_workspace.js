import GeoServerRestClient from 'geoserver-node-client';

const geoserverUrl = process.env.GEOSERVER_REST_URL;

const geoserverDefaultUser = process.env.GEOSERVER_DEFAULT_USER;
const geoserverDefaultPw = process.env.GEOSERVER_DEFAULT_PASSWORD;

const workspaceOverlay = 'klips';
const workspaceOverLayUri = 'https://www.meggsimum.de/namespace/klips';

// check if we can connect to GeoServer REST API
const grc = new GeoServerRestClient(geoserverUrl, geoserverDefaultUser, geoserverDefaultPw);
grc.about.exists()
  .then(() => {
    createWorkspaces();
  })
  .catch(() => {
    console.error('ERROR', 'Could not connect to GeoServer REST API - ABORT!');
  });

/**
 * Create the workspaces.
 */
async function createWorkspaces () {
  console.log();
  console.log('### WORKSPACES ###');
  console.log();

  const wsOverLayerExists = await grc.namespaces.get(workspaceOverlay);
  if (!wsOverLayerExists) {
    try {
      await grc.namespaces.create(workspaceOverlay, workspaceOverLayUri);
      console.log(`SUCCESS: Created Workspace: '${workspaceOverlay}'`);
    } catch (error) {
      console.error('ERROR', error);
    }
  }
}
