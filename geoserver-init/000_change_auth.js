import { GeoServerRestClient } from 'geoserver-node-client';
import { logger } from './logger.js';
import { sleep } from './util.js';

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
  logger.error('Not all variables provided. Please specify these env vars: \n ' +
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
    logger.warn('Could not connect to GeoServer REST API - seems like auth has been changed in this setup!');
  });

/**
 * Adapts security settings for GeoServer
 */
async function adaptSecurity () {
  try {
    const user = newGeoserverUser;
    const userPw = newGeoserverPw;

    if (!user || !userPw || user === '' || userPw === '') {
      logger.error('No valid user or user password given - EXIT.');
      return;
    }

    await grc.security.createUser(user, userPw);
    logger.info(`Successfully created user ${user}`);

    await grc.security.associateUserRole(user, role);
    logger.info(`Successfully added role ${role} to user ${user}`);

    // disable user
    const userEnabled = false;
    await grc.security.updateUser(geoserverDefaultUser, geoserverDefaultPw, userEnabled);
    logger.info('Successfully disabled default "admin" user');

    // TODO: this is a pragmatic solution to ensure the newly created user can actually log in
    //       it is required, because the workers often request GeoServer and therefore delay the
    //       moment until the newly created user is usable.
    //       Ideally here we have a function that waits for the moment until we can successfully login
    const secondsToWait = 10;
    logger.debug(`Waiting for ${secondsToWait} seconds to give GeoServer time to register the new user.`);

    await sleep(secondsToWait);
    logger.debug('Waiting over...');
  } catch (error) {
    logger.info('Could not log in - credentials have probably been changed already');
  }
}
