import { Params } from '../types';

export const validateParams = (params: Params) => {
  if (
    params.hasOwnProperty('region') &&
    params.hasOwnProperty('geom') &&
    params.hasOwnProperty('band')
    // params.hasOwnProperty('threshold')
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

export const validateParamsThreshold = (params: Params) => {
  if (Number(params.threshold)) {
    return true;
  }
};
