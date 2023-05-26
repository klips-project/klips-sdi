/* eslint-disable no-console */
import '../../style.css';
import { getParams, parseURLPathnames } from '../../util/Url';
import { validateParams } from '../../util/Config';

import { ChartAPI } from '../Chart';

import { Params } from '../../types';
import { pathNameConfig } from '../../constants';


class WidgetAPI {
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

    // get dom
    const domEl = document.querySelector('#widget');

    if (!domEl) {
      throw new Error('Could not find widget element in dom.');
    }

    // create widget
    switch (this.params.widget) {
    case 'chart':
      this.widget = new ChartAPI(this.params, domEl as HTMLElement);
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

export default WidgetAPI;
