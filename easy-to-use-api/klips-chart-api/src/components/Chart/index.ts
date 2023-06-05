/* eslint-disable no-console */
import dayjs from 'dayjs';
import { fetchTimeSeriesData } from '../../service/ogc-api-service';
import {
  EChart,
  EChartsLineSeriesOption, EChartsXaxisOption, EChartsYaxisOption, Params, TimeSeriesData
} from '../../types';

import * as echarts from 'echarts';
import {
  createSeriesData,
  createVisualMap, createXaxisOptions, createYaxisOptions, formatChartData, setupBaseChart
} from '../../util/Chart';

export class ChartAPI {
  public params: Params;
  public chartData: TimeSeriesData;
  public chart: EChart;
  public chartOptions: echarts.EChartsOption;
  public seriesData: EChartsLineSeriesOption[];
  public xAxesOptions: EChartsXaxisOption[];
  public yAxesOptions: EChartsYaxisOption;
  public currentTimestamp: string;

  constructor(params: Params) {
    this.params = params;
    this.chartData = this.getChartData('Peter', [1, 2]);
    this.currentTimestamp = this.chartData[48]?.timestamp;

    // setup chart
    this.chartOptions = setupBaseChart();

    const chartDom = document.querySelector('#chart');

    if (!chartDom) {
      throw new Error('No div found for chart rendering.');
    }

    this.chart = echarts.init(chartDom as HTMLElement);

    // create bottom xAxis to display hours range (from -48h to +48h)
    const hoursRange = [];
    for (let i = -48; i <= 48; i++) {
      hoursRange.push(`${i}h`);
    }
    // TODO check easy and lightweight i18n solution
    hoursRange[48] = 'now';
    const xAxis1 = createXaxisOptions({
      data: hoursRange,
      axisLabel: {
        interval: 11
      }
    });

    // create top xAxis to display timestamps
    const xAxis2 = createXaxisOptions({
      data: this.chartData.map((dataPoint) => {
        return dayjs(dataPoint.timestamp).format('DD.MM HH:mm');
      }),
      axisLabel: {
        interval: 11,
        rotate: -30
      }
    });
    this.xAxesOptions = [xAxis1, xAxis2];
    this.yAxesOptions = createYaxisOptions();

    // create series based on chart data
    this.seriesData = [];
    const formattedData = formatChartData(this.chartData);
    Object.entries(formattedData).forEach(([band, dataArray]) => {
      let series = createSeriesData({
        name: 'perceived temperature',
        data: dataArray.map(dataPoint => {
          return dataPoint[1];
        }),
        // TODO make this dependant on data (°C vs Kelvin axis)
        xAxisIndex: 1
      });
      this.seriesData?.push(series);
    });

    // check if threshold is given
    if (this.params && this.params.threshold) {
      // define visualMap for chart
      const visualMap = createVisualMap(parseInt(this.params.threshold, 10));
      this.chart.setOption({
        visualMap: visualMap
      });
      // add dummy series to display threshold line and markarea
      const thresholdSeries: echarts.LineSeriesOption = {
        name: 'threshold dummy series',
        type: 'line',
        silent: true,
        animation: false,
        markArea: {
          itemStyle: {
            color: '#a81a04',
            opacity: 0.05
          },
          data: [
            [
              {
                yAxis: this.params.threshold
              },
              {
                yAxis: 100
              }
            ],
          ]
        },
      };
      this.seriesData.push(thresholdSeries);
    };

    // set chart options
    this.chart.setOption({
      xAxis: this.xAxesOptions,
      yAxis: this.yAxesOptions,
      series: this.seriesData,
      toolbox: {
        right: 75,
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          saveAsImage: {}
        }
      }
    });
  };

  static async getChartData(
    params: Params
  ) {
    // Retrieve chart data from ogc-api-process
    const data = await fetchTimeSeriesData(params);
    debugger
    return new ChartAPI(params);
  }

  render() {
    // this will trigger rendering of chart
    this.chart.setOption(this.chartOptions);
  }

};
