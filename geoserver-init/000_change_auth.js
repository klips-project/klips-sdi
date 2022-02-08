import GeoServerRestClient from 'geoserver-node-client';

const geoserverUrl = process.env.GEOSERVER_REST_URL;
const geoserverDefaultUser = process.env.GEOSERVER_DEFAULT_USER;
const geoserverDefaultPw = process.env.GEOSERVER_DEFAULT_PASSWORD;

// the GeoServer role to assign to the new user
const role = 'ADMIN';

// read GS login from secrets
const newGeoserverUser = process.env.GEOSERVER_USER;
const newGeoserverPw = process.env.GEOSERVER_PASSWORD;

/**
 * Adapts security settings for GeoServer
 */
async function adaptSecurity () {
  const user = newGeoserverUser;
  const userPw = newGeoserverPw;

  if (!user || !userPw || user === '' || userPw === '') {
    console.error('ERROR: No valid user or user password given - EXIT.');
    return;
  }

  const userCreated = await grc.security.createUser(user, userPw);
  if (userCreated) {
    console.info(`INFO: Successfully created '${user}'`);
  } else {
    console.error(`ERROR: Failed creating user '${user}'`);
  }

  const roleAssigned = await grc.security.associateUserRole(user, role);
  if (roleAssigned) {
    console.info(`INFO: Successfully added role '${role}' to user '${user}'`);
  } else {
    console.error(`ERROR: Failed adding role '${role}' to user '${user}'`);
  }

  // disable user
  const adminDisabled = await grc.security.updateUser(geoserverDefaultUser, geoserverDefaultPw, false);
  if (adminDisabled) {
    console.info('INFO: Successfully disabled default user');
  } else {
    console.error('ERROR: Failed disabling default user');
  }
}

// check if we can connect to GeoServer REST API
const grc = new GeoServerRestClient(geoserverUrl, geoserverDefaultUser, geoserverDefaultPw);
grc.exists().then(gsExists => {
  if (gsExists === true) {
    adaptSecurity();
  } else {
    console.error('Could not connect to GeoServer REST API - seems like auth has been changed in this setup!');
  }
});
