/* eslint-disable no-console */
import { getParams } from './util/Url';
import { validateParams } from './util/Config';

import './style.css';

// @ts-ignore
const host = import.meta.env.MODE === 'development' ? 'http://localhost:81' : 'https://klips-dev.terrestris.de';
export const url = `${host}/processes/timelapse-video/execution`;
/*
 * Example request: http://localhost:5173/?region=dresden&area-of-interest={%22coordinates%22:%20[[[13.72242,%2051.04242],[13.72242,%2051.06019],[13.74525,%2051.06019],[13.74525,%2051.04242],[13.72242,%2051.04242]]],%22type%22:%20%22Polygon%22}&output=mp4&title=Test
 */

try {
  // parse params
  const params = getParams('search');

  // validate params
  if (!params || !validateParams(params)) {
    throw new Error('Incomplete url params.');
  }

  const region = params?.region?.toLowerCase();
  const areaOfInterest = params?.['area-of-interest'];
  const output = params?.output?.toLowerCase();
  const title = params?.title || '';

  // TODO: handle region and output parameter
  if (!(region === 'dresden' ||
      region === 'langenfeld') ||
      !areaOfInterest ||
      output !== 'mp4') {
    throw new Error('Invalid url params.');
  }

  let json;
  try {
    json = JSON.parse(areaOfInterest);
  } catch {
    throw new Error('Could not parse geometry.');
  }
  const loadmask: HTMLDivElement | null = document.querySelector('#loadmask');
  const videoEl: HTMLVideoElement | null = document.querySelector('#video-element');

  if (!loadmask || !videoEl) {
    throw new Error('Could not find required dom elements');
  }

  loadmask.style.visibility = 'visible';

  const body = {
    inputs: {
      title: title,
      polygonGeoJson: json,
      location: region
    }
  };
  fetch(url, {
    body: JSON.stringify(body),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.blob())
    .then(blob => {
      loadmask.classList.add('fadeout');
      const videoUrl = URL.createObjectURL(blob);
      videoEl.classList.add('fadein');
      videoEl.src = videoUrl;
    });
} catch (error) {
  console.error(error);
  const errorElement: HTMLElement | null = document.querySelector('#error');

  if (errorElement) {
    errorElement.style.display = 'block';
    errorElement.textContent = 'An unexpected error has occured. Please check the console.';
  }
}
