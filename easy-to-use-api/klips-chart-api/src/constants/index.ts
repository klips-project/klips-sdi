import {
  BoundingBoxObject,
  PathNameConfig
} from '../types';

// define pathname for widget, e.g. /chart/dresden/Point(xy)/20
export const pathNameConfig: PathNameConfig = {
  path2: 'region',
  path3: 'geom',
  path4: 'threshold',
  path5: 'band',
};

// adapt process url for development if needed
// @ts-ignore
const host = import.meta.env.MODE === 'development' ? 'http://localhost:81' : 'https://klips2024.terrestris.de';
export const processURL = `${host}/processes/location-info-time-rasterstats/execution`;

export const processURLPolygon = `${host}/processes/zonal-statistics-time-rasterstats/execution`;

export const boundingBox: BoundingBoxObject = {
  dresden: [
    13.58737,
    50.97203,
    13.95898,
    51.15370
  ],
  langenfeld: [
    6.91297,
    51.08538,
    6.99077,
    51.13902
  ]
};
