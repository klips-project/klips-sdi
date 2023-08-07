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
