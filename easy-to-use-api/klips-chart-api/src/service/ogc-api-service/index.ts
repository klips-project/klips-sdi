import { Params } from '../../types';
import { processURL, boundingBox } from '../../constants';
import { validateParams, validateParamsRegion } from '../../util/Config';
import { pointInRect } from '../../util/Chart';

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

export const generateErrorMessages = (
  params: Params
): any => {

  // validate params
  const errorElementURL: HTMLElement | null = document.querySelector('#error-URL');
  const linkDocs: String = './docs'
  const linkDocsHTML: String = `<div><a href = ${linkDocs}>Informationen zu den Eingabeparametern</a></div>`

  if (!validateParams(params)) {
    if (errorElementURL) {
      errorElementURL.style.display = 'block';
      errorElementURL.innerHTML = `<div><span>Ungültige URL. Bitte prüfen Sie die eingegebenen Parameter.</span></div>${linkDocsHTML}`;
    }
    throw new Error('Invalid param names in URL.');
  }
  // validate region parameter
  if (!validateParamsRegion(params)) {
    if (errorElementURL) {
      errorElementURL.style.display = 'block';
      errorElementURL.innerHTML = `<div><span>Ungültige URL. Bitte prüfen Sie die eingegebenen Parameter für "region".</span></div>${linkDocsHTML}`;
    }
    throw new Error('Invalid region.');
  }
  // check if point geometry is within boundary box
  if (!pointInRect(boundingBox[params.region!], params.wktGeometry)) {
    if (errorElementURL) {
      errorElementURL.style.display = 'block';
      errorElementURL.innerHTML = `<div><span>Ungültige Koordinateneingabe. Die eingegebenen Koordinaten liegen nicht in der ausgewählten Region. Bitte prüfen Sie die eingegebenen Parameter für "geomwkt".</span></div>${linkDocsHTML}`;
    }
    throw new Error(`Point coordinates outside of boundary box: ${boundingBox[params.region!].toString()}`);
  }

}
