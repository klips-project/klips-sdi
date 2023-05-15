/* eslint-disable no-console */
import { Params } from '../../types';

import * as echarts from 'echarts';

export type EChartsOption = echarts.EChartsOption;

export class ChartAPI {
  public params: Params;
  public chartData: any;
  public chart: any;

  constructor(params: Params) {
    this.params = params;

    this.chartData = this.createChartOptions(this.params);

    const chartDom = document.querySelector('#widget');

    if (!chartDom) {
      throw new Error('No div found for chart rendering.');
    }

    this.chart = echarts.init(chartDom as HTMLElement);

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
