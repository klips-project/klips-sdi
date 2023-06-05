import { PathNameConfig } from '../types';

// define pathname for widget, e.g. /chart/dresden/Point(xy)/20
export const pathNameConfig: PathNameConfig = {
  path2: 'region',
  path3: 'geomwkt',
  path4: 'threshold'
};

export const processURL = window.location.href.indexOf('localhost') > -1 ?
  'http://localhost:5000/processes/location-info-time-rasterstats/execution/' :
  'https://klips-dev.terrestris.de/processes/timelapse-video/execution';
