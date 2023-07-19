import { Params } from '../types';

export const validateParams = (params: Params) => {
  if (
    params.hasOwnProperty('region') &&
    params.hasOwnProperty('geomwkt') &&
    params.hasOwnProperty('threshold')
  ) {
    return true;
  }
};
// check params content
export const validateParamsRegion = (params: Params) => {
  if (
    params.region?.includes('dresden') ||
    params.region?.includes('langenfeld')
  ) {
    return true;
  }
};
