/* eslint-disable no-console */
import { ChartAPI } from './components/Chart';
import { getParams, parseURLPathnames } from './util/Url';
import { pathNameConfig } from './constants';
import { validateParams } from './util/Config';

import './style.css';

// use top-level async function to make use of await
(async () => {
  try {
    // parse params
    let params;
    if (document.location.search) {
      params = getParams('search');
    } else if (document.location.pathname.length > 1) {
      params = parseURLPathnames(document.location.pathname, pathNameConfig);
    }

    // validate params
    if (!params || !validateParams(params)) {
      throw new Error('Ungültige Parameter in der URL.');
    }

    // get dom
    const domEl = document.querySelector('#chart');

    if (!domEl) {
      throw new Error('Zielelement wurde nicht gefunden.');
    }

    const chartApi = await ChartAPI.getChartData(params);

    if (chartApi) {
      chartApi.render();
    }
  } catch (error) {
    console.error(error);
    const errorElement: HTMLElement | null = document.querySelector('#error');

    if (errorElement) {
      errorElement.style.display = 'block';
      errorElement.textContent = 'Unerwarteter Fehler. Bitte überprüfen Sie die Konsole.';
    }
  }
})();
