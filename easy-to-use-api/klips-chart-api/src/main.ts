/* eslint-disable no-console */
import { ChartAPI } from './components/Chart';
import { ChartAPIDocs } from './components/Docs';
import { getParams, parseURLPathnames } from './util/Url';
import { pathNameConfig } from './constants';

import './style.css';

// use top-level async function to make use of await
(async () => {
  // create table content for docs
  let tableContent;
  try {
    const resp = await fetch('content.json');
    if (!resp.ok) {
      throw new Error("Could not fetch table content");
    }
    tableContent = await resp.json();


  } catch (error) {
    console.log(error);
  }

  try {
    // parse params
    let params;
    if (document.location.pathname.includes('docs')) {
      const chartAPIDocs = new ChartAPIDocs(tableContent.params, tableContent.title, tableContent.text, tableContent.example);
      chartAPIDocs.render();
      return;
    }
    else if (document.location.search) {
      params = getParams('search');
    } else if (document.location.pathname.length > 1) {
      params = parseURLPathnames(document.location.pathname, pathNameConfig);
    }

    // validate params
    if (!params) {
      throw new Error('Invalid url params.');
    }

    // get dom
    const domEl = document.querySelector('#chart');

    if (!domEl) {
      throw new Error('Could not find target element in dom.');
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
      errorElement.textContent = 'An error has occured. Please check the console.';
    }
  }
})();
