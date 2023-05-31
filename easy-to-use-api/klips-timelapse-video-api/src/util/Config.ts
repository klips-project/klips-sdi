import { Params } from '../types';

// TODO improve validation (geometry checking etc.)
export const validateParams = (params: Params) => {
  if (
    params.hasOwnProperty('region') &&
    params.hasOwnProperty('area-of-interest') &&
    params.hasOwnProperty('output')
  ) {
    return true;
  }
};
