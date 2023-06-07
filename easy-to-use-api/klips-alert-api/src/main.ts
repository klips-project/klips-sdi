/* eslint-disable no-console */
import { getParams, parseURLPathnames } from '../../klips-chart-api/src/util/Url';
import { pathNameConfig } from '../../klips-chart-api/src/constants';
import { validateParams } from '../../klips-chart-api/src/util/Config';
import "@fortawesome/fontawesome-free/webfonts/fa-solid-900.ttf";
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import dayjs from 'dayjs';

import './style.css';


let params;
if (document.location.search) {
  params = getParams('search');
} else if (document.location.pathname.length > 1) {
  params = parseURLPathnames(document.location.pathname, pathNameConfig);
}

// validate params
if (!params || !validateParams(params)) {
  throw new Error('Invalid url params.');
}

// TODO get value for heat island from data
const HeatIsland = false;

// show/hide heat island warning
const warning = document.querySelector('#warning') as HTMLElement;
const noWarning = document.querySelector('#noWarning') as HTMLElement;

if (warning != null  && noWarning != null) {
if (HeatIsland) {
  console.log('Potential heat island in the next 48h');
  warning.style.display = 'block';
  noWarning.style.display = 'none';
} else {
  console.log('No potential heat island in the next 48h');
  noWarning.style.display = 'block';
  warning.style.display = 'none';
}
};

// add current Timestamp
const currentTime = dayjs().format('DD.MM.YYYY HH:mm');
const currentDateElement = (HeatIsland) ? document.querySelectorAll('.current-date')[0] : document.querySelectorAll('.current-date')[1];
if (!currentDateElement) {
  console.warn('Could not find date element.');
}
else {
  currentDateElement.innerHTML = currentTime;
  console.log(currentTime);
}

// add location
const currentLocation = String(params.geomwkt);

const currentLocationElement = (HeatIsland) ? document.querySelectorAll('.current-location')[0] : document.querySelectorAll('.current-location')[1];
if (!currentLocationElement) {
  console.warn('Could not find location element.');
}
else {
  currentLocationElement.innerHTML = currentLocation;
  console.log(currentLocation);
}

