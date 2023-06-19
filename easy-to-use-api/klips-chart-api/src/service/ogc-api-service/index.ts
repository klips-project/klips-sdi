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
      startTimeStamp: '2000-01-01T12:32:00Z',
      endTimeStamp: '2024-12-31T12:32:00Z'
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
