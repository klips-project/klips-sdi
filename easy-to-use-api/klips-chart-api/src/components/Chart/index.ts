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

import WKTParser from 'jsts/org/locationtech/jts/io/WKTParser';

export class ChartAPI {
  public params: Params;
  public chartData: TimeSeriesData;
  public chart: EChart;
  public chartOptions: echarts.EChartsOption;
  public seriesData: EChartsLineSeriesOption[];
  public xAxisOptions: EChartsXaxisOption[];
  public yAxisOptions: EChartsYaxisOption;
  public currentTimestamp: string;

  constructor(params: Params, data: any) {
    this.params = params;
    this.chartData = data;
    this.currentTimestamp = this.chartData[1].timestamp;

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
    this.xAxisOptions = [xAxis1, xAxis2];
    this.yAxisOptions = createYaxisOptions();

    // create series based on chart data
    this.seriesData = [];
    const formattedData = formatChartData(this.chartData);
    Object.entries(formattedData).forEach(([, dataArray]) => {
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
      xAxis: this.xAxisOptions,
      yAxis: this.yAxisOptions,
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
    // TODO use time stamps as soon as real data is available
    // const currentTimestamp = dayjs();
    // const startTimestamp = dayjs().subtract(48, "hours");
    // const endTimestamp = dayjs().add(48, "hours");
    // check wkt param TODO validation and reprojection
    const wktReader = new WKTParser();
    if (!params.geomwkt) {
      return;
    }
    const wktGeometry = wktReader.read(params.geomwkt);
    // Retrieve chart data from ogc-api-process
    const data = await fetchTimeSeriesData(params, wktGeometry.getCoordinates()[0]);

    return new ChartAPI(params, data.values);
  }

  render() {
    // this will trigger rendering of chart
    this.chart.setOption(this.chartOptions);
  }

};
