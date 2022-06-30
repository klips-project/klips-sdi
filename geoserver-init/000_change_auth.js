import { GeoServerRestClient } from 'geoserver-node-client';

const geoserverUrl = process.env.GEOSERVER_REST_URL;
const geoserverDefaultUser = process.env.GEOSERVER_DEFAULT_USER;
const geoserverDefaultPw = process.env.GEOSERVER_DEFAULT_PASSWORD;

// the GeoServer role to assign to the new user
const role = 'ADMIN';

// read GS login from secrets
const newGeoserverUser = process.env.GEOSERVER_USER;
const newGeoserverPw = process.env.GEOSERVER_PASSWORD;

// check if all variables are present
if (!geoserverUrl || !geoserverDefaultUser || !geoserverDefaultPw || !newGeoserverUser || !newGeoserverPw) {
  console.error('ERROR', 'Not all variables provided. Please specify these env vars: \n ' +
   'GEOSERVER_REST_URL\n GEOSERVER_DEFAULT_USER\n GEOSERVER_DEFAULT_PASSWORD\n GEOSERVER_USER\n GEOSERVER_PASSWORD\n');
  process.exit(1);
}

// check if we can connect to GeoServer REST API
const grc = new GeoServerRestClient(geoserverUrl, geoserverDefaultUser, geoserverDefaultPw);

grc.about.exists()
  .then(() => {
    adaptSecurity();
  })
  .catch(() => {
    console.warn('WARN', 'Could not connect to GeoServer REST API - seems like auth has been changed in this setup!');
  });

/**
 * Adapts security settings for GeoServer
 */
async function adaptSecurity () {
  try {
    const user = newGeoserverUser;
    const userPw = newGeoserverPw;

    if (!user || !userPw || user === '' || userPw === '') {
      console.error('ERROR: No valid user or user password given - EXIT.');
      return;
    }

    await grc.security.createUser(user, userPw);
    console.info('INFO', 'Successfully created user', user);

    await grc.security.associateUserRole(user, role);
    console.info('INFO', `Successfully added role ${role} to user ${user}`);

    // disable user
    await grc.security.updateUser(geoserverDefaultUser, geoserverDefaultPw, false);
    console.info('INFO', 'Successfully disabled default "admin" user');
  } catch (error) {
    console.warn('WARN', 'Could not adapt security, I might be done already.');
  }
}
