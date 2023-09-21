import {
    GeoServerRestClient
} from 'geoserver-node-client';
import {
    logger
} from './logger.js';
import {
    geoserverUrl,
    geoserverUser,
    geoserverPw,
} from './constants.js'


// check if we can connect to GeoServer REST API
const grc = new GeoServerRestClient(geoserverUrl, geoserverUser, geoserverPw);

// Adds basic contact information
export const addContactInformation = async () => {
    const address = 'Kölnstr. 99';
    const city = 'Bonn';
    const country = 'Germany';
    const state = 'Nordrhein-Westfalen';
    const postalCode = '53111';
    const email = 'rothstein@terrestris.de';
    const organization = 'KLIPS Project';
    const contactPerson = 'terrestris GmbH & Co. KG';
    const phoneNumber = undefined;

    try {
        await grc.settings.updateContactInformation(address, city, country, postalCode, state, email, organization, contactPerson, phoneNumber);
        logger.info('Changed contact information');
    } catch (error) {
        logger.error({
            error
        }, 'Changing contact information failed');
    }
}

addContactInformation();
