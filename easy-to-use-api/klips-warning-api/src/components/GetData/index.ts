// @ts-ignore
import WKTParser from 'jsts/org/locationtech/jts/io/WKTParser';
// @ts-ignore
import GeoJSONWriter from 'jsts/org/locationtech/jts/io/GeoJSONWriter';
import { Params } from '../../types';
import params from '../../Url';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);



// Get Timeframe
const startDate = dayjs().utc().format('YYYY-MM-DDTHH:00:00Z');
const endDate = dayjs().add(49, 'hours').utc().format('YYYY-MM-DDTHH:00:00Z');

// Get temperature value
const processURL = 'https://klips-dev.terrestris.de/processes/location-info-time-rasterstats/execution';
const processURLPolygon = 'https://klips-dev.terrestris.de/processes/zonal-statistics-time-rasterstats/execution';


const fetchTemperaturePoint = async (
    params: Params,
    coordinates: any
): Promise<any> => {
    const body = {
        inputs: {
            x: coordinates.x,
            y: coordinates.y,
            cogDirUrl: `http://nginx/cog/${params.region}/${params.region}_temperature/`,
            inputCrs: 'EPSG:4326',
            startTimeStamp: startDate,
            endTimeStamp: endDate,
            bands: [1, 2, 3]
        }
    };
    const url = processURL;
    const response = await fetch(url, {
        body: JSON.stringify(body),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
    }

    return response.json();
};

const fetchTemperaturePolygon = async (
    params: Params,
    coordinates: any
): Promise<any> => {
    const body = {
        inputs: {
            polygonGeoJson: coordinates,
            cogDirUrl: `http://nginx/cog/${params.region}/${params.region}_temperature/`,
            statisticMethods: ['mean', 'max', 'min'],
            inputCrs: 'EPSG:4326',
            startTimeStamp: startDate,
            endTimeStamp: endDate,
            bands: [1, 2, 3]
        }
    };
    const url = processURLPolygon;
    const response = await fetch(url, {
        body: JSON.stringify(body),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
    }

    return await response.json().then(response => { return response });
};


// get WKT
const wktReader = new WKTParser();
const wktGeometry = wktReader.read(params.geom);

// get GeoJSON
const geoJSONWriter = new GeoJSONWriter();
const geoJSONGeometry = geoJSONWriter.write(wktGeometry);

// get data
let dataSeries: any;
if (params.geom?.includes('POLYGON')) {
    dataSeries = await fetchTemperaturePolygon(params, geoJSONGeometry).then(response => { return response });
} else {
    dataSeries = await fetchTemperaturePoint(params, wktGeometry.getCoordinates()[0]).then(response => { return response });
};

const temperature = dataSeries.values;

export default temperature;
