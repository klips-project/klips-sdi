/* eslint-disable no-console */
import { Params } from '../../types';

import * as echarts from 'echarts';

export type EChartsOption = echarts.EChartsOption;

export class ChartAPI {
  public params: Params;
  public domElement: HTMLElement;
  public chartData: any;
  public chart: any;

  constructor(params: Params, domElement: HTMLElement) {
    this.params = params;
    this.domElement = domElement;

    this.chartData = this.createChartOptions(this.params);

    if (!domElement) {
      throw new Error('No DOM element found for rendering.');
    }

    this.chart = echarts.init(domElement);

  }

  createChartOptions(params: Params) {
    console.log('create chart data');
    console.log(params);

    return {
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [150, 230, 224, 218, 135, 147, 260],
          type: 'line'
        }
      ]
    };
  }

  render() {
    // this will trigger rendering of chart
    this.chart.setOption(this.chartData);
  }

};
