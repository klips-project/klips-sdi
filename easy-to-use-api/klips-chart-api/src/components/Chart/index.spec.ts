/**
 * @jest-environment jsdom
 */
import { ChartAPI } from './index';
import { Params } from '../../types';

describe('<ChartAPI>', () => {
  beforeAll(() => {
    // mock dom element and append to body
    const el = document.createElement('div');
    el.id = 'widget';
    el.style.width = '400px';
    el.style.height = '400px';

    document.body.appendChild(el);

  });

  it('target dom should exist', () => {
    const domEl = document.querySelector('#widget');

    expect(domEl).not.toBeNull();

    expect(domEl).toBeInTheDocument();
  });

  it('should initialize', () => {
    const domEl = document.querySelector('#widget');

    if (!domEl) {
      return;
    }
    const testParams: Params = {
      geom: 'POINT(10 30)',
      region: 'dresden',
      threshold: '25'
    };

    // chart must be created in window.onload callback to have valid clientWidth and clientHeight
    window.onload = () => {
      const chartApi = new ChartAPI(testParams, domEl as HTMLElement);

      expect(chartApi.chartData).toBeDefined();

      expect(chartApi.chart).toBeDefined();
    };

    // TODO test if chart can be rendered
  });
});
