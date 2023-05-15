import { Params, PathNameConfig } from "../types";

/**
 * Parses query string like a=b&c=d&e=f etc of the given search part (querySearch) of an URL
 * as JS object (key-value). Uses ES6 coding/parsing as in:
 * https://www.arungudelli.com/tutorial/javascript/get-query-string-parameter-values-from-url-using-javascript/
 *
 * @param  {String} query Search part (queryString) of an URL
 * @return {Object} Key-value pairs of the URL parameters
 */
export const parseQueryString = (query: string): Params => {
  return (/^[?#]/.test(query) ? query.slice(1) : query)
    .split('&')
    .reduce((params: Params, param) => {
      const [key, value] = param.split('=');
      params[key as keyof Params] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
      return params;
    }, {});
};

/**
 * Returns the query params of the current 'location' from 'hash' or 'search'.
 *
 * @param  {String} locationType use query or hash part of URL
 * @return {Object} Key-value pairs of the URL parameters
 */
export const getParams = (locationType: string) => {
  const querySearch = document.location[locationType as keyof Location];

  if (!querySearch || querySearch === '') {
    return {};
  } else if (typeof querySearch === 'string') {
    // remove leading ? from string before parsing
    return parseQueryString(querySearch.substring(1));
  }
};

/**
 * Parses the pathnames from a URL and extracts the corresponding parameters based on the provided configuration.
 * @param {string} locationPathname - The URL pathname to parse.
 * @param {PathNameConfig} config - The configuration object that maps parameter keys to their corresponding index in the URL pathname.
 * @returns {Params} - An object containing the extracted parameters.
 */
export const parseURLPathnames = (locationPathname: string, config: PathNameConfig): Params => {
  let params: Params = {};

  const pathSegments = locationPathname.split('/').filter(segment => segment !== '');

  Object.values(config).forEach((v, idx) => {
    params[v as keyof Params] = pathSegments[idx];
  });

  return params;
}
