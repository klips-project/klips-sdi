 // Get parameters from URL
import { Params } from "../types";

// define pathname for widget
const pathNameConfig: any = {
    path1: 'region',
    path2: 'geom',
    path3: 'threshodgreen',
    path4: 'thresholdorange',
    path5: 'thresholdred',
    path6: 'band',
};

const parseQueryString = (query: string): Params => {
    return (/^[?#]/.test(query) ? query.slice(1) : query)
        .split('&')
        .reduce((params: Params, param) => {
            const [key, value] = param.split('=');
            params[key as keyof Params] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
            return params;
        }, {});
};

const getParams = (locationType: string) => {
    const querySearch = document.location[locationType as keyof Location];

    if (!querySearch || querySearch === '') {
        return {};
    } else if (typeof querySearch === 'string') {
        // remove leading ? from string before parsing
        return parseQueryString(querySearch.substring(1));
    }
};

const parseURLPathnames = (locationPathname: string, config: any): Params => {
    let params: Params = {};

    const pathSegments = locationPathname.split('/').filter(segment => segment !== '');

    Object.values(config).forEach((v, idx) => {
        params[v as keyof Params] = pathSegments[idx];
    });

    return params;
};

let params;
if (document.location.search) {
    params = getParams('search');
} else if (document.location.pathname.length > 1) {
    params = parseURLPathnames(document.location.pathname, pathNameConfig);
}
console.log(params);

export default params as Params;
