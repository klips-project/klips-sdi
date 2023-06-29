import { PathNameConfig } from '../types';

// define pathname for widget, e.g. /chart/dresden/Point(xy)/20
export const pathNameConfig: PathNameConfig = {
  path2: 'region',
  path3: 'geomwkt',
  path4: 'threshold'
};

export const processURL = 'https://klips-dev.terrestris.de/processes/location-info-time-rasterstats/execution';
//  window.location.href.indexOf('localhost') > -1 ?
// 'http://localhost:5000/processes/location-info-time-rasterstats/execution/' :
// 'https://klips-dev.terrestris.de/processes/location-info-time-rasterstats/execution';

export const boundaryBox = {
  'dresden': {
    x1: 13.58737,
    x2: 13.95898,
    y1: 50.97203,
    y2: 51.15370
  },
  'langenfeld': {
    x1: 6.91297,
    x2: 6.99077,
    y1: 51.08538,
    y2: 51.13902
  }
}