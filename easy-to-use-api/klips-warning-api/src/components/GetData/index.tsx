import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);
// Get Timeframe
const startDate = dayjs().utc().format('YYYY-MM-DDTHH:00:00Z');
const endDate = dayjs().add(49, 'hours').utc().format('YYYY-MM-DDTHH:00:00Z');

// Get temperature value
const processURL = 'https://klips-dev.terrestris.de/processes/location-info-time-rasterstats/execution';
const processURLPolygon = 'https://klips-dev.terrestris.de/processes/zonal-statistics-time-rasterstats/execution';

export const fetchTemperaturePoint = async (
    region: String,
    coordinates: any
): Promise<any> => {
    const body = {
        inputs: {
            x: coordinates.x,
            y: coordinates.y,
            cogDirUrl: `http://nginx/cog/${region}/${region}_temperature/`,
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

    return await response.json();
};

export const fetchTemperaturePolygon = async (
    region: String,
    coordinates: any
): Promise<any> => {
    const body = {
        inputs: {
            polygonGeoJson: coordinates,
            cogDirUrl: `http://nginx/cog/${region}/${region}_temperature/`,
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

    return await response.json();
};
