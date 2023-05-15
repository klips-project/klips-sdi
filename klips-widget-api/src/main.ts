/* eslint-disable no-console */
import './style.css';
import { getParams, parseURLPathnames } from './util/Url';
import { validateParams } from './util/Config.js';

import ChartApi from './components/Chart/index.js';

import { Params } from './types';
import { pathNameConfig } from './constants/index.js';

const widgetApi = class WidgetAPI {
  public params: Params | undefined = undefined;
  // TODO define type for widget
  public widget: any = undefined;
  public error: boolean = false;
  public errorMessage: string | undefined = undefined;

  constructor() {
    // parse params
    if (document.location.search) {
      this.params = getParams('search');
    } else if (document.location.pathname.length > 1) {
      this.params = parseURLPathnames(document.location.pathname, pathNameConfig);
    }

    // validate params
    if (!this.params || !validateParams(this.params)) {
      this.errorMessage = 'Invalid url params.';
      console.error(this.errorMessage);
      this.error = true;
      return;
    }

    // create widget
    switch (this.params.widget) {
    case 'chart':
      this.widget = new ChartApi(this.params);
      break;
    default:
      return;
    }

  }

  render() {
    if (this.error) {
      return (`<div>${this.errorMessage}</div>`);
    }
    if (this.widget) {
      this.widget.render();
    }
    else {
      return (
        '<div>empty</div>'
      );
    }
  };

};

try {
  const api = new widgetApi();

  api.render();
} catch (error) {
  console.error(error);
}
