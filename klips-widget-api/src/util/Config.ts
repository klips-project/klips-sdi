import { Params } from '../types';

// TODO improve validation (geometry checking etc.)
export const validateParams = (params: Params) => {
  if (
    params.hasOwnProperty("widget") &&
    params.hasOwnProperty("region") &&
    params.hasOwnProperty("geomwkt") &&
    params.hasOwnProperty("threshold")
  ) {
    return true;
  }
};
