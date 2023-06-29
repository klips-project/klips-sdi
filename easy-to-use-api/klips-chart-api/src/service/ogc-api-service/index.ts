import { Params } from '../../types';
import { processURL } from '../../constants';

export const fetchTimeSeriesData = async (
  params: Params,
  coordinates: any
): Promise<any> => {
  const body = {
    inputs: {
      x: coordinates.x,
      y: coordinates.y,
      cogDirUrl: `http://nginx/cog/${params.region}/${params.region}_temperature/`,
      inputCrs: 'EPSG:4326',
      startTimeStamp: params.startTimestamp,
      endTimeStamp: params.endTimestamp,
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
