// the GeoServer role to assign to the new user
export const role = 'ADMIN';

// Login information
export const geoserverDefaultUser = process.env.GEOSERVER_DEFAULT_USER;
export const geoserverDefaultPw = process.env.GEOSERVER_DEFAULT_PASSWORD;

export const geoserverUrl = process.env.GEOSERVER_REST_URL;
export const geoserverUser = process.env.GEOSERVER_USER;
export const geoserverPw = process.env.GEOSERVER_PASSWORD;

// Workspaces
/** Workspace for generic objects like styles */
export const genericWorkspace = 'klips';
export const workspaces = ['dresden', 'langenfeld', genericWorkspace];
