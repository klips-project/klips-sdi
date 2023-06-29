/* eslint-disable no-console */
import dayjs from 'dayjs';
import { fetchTimeSeriesData } from '../../service/ogc-api-service';
import {
  Params,
  TimeSeriesData
} from '../../types';

// import echart types
import {
  EChartsOption,
  LineSeriesOption,
  XAXisComponentOption,
  YAXisComponentOption,
} from 'echarts';

import * as echarts from 'echarts/core';
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  VisualMapComponent
} from 'echarts/components';

import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  CanvasRenderer,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  MarkLineComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  UniversalTransition,
  VisualMapComponent
]);

import {
  createSeriesData,
  createVisualMap,
  createXaxisOptions,
  createYaxisOptions,
  formatChartData,
  setupBaseChart
} from '../../util/Chart';

import WKTParser from 'jsts/org/locationtech/jts/io/WKTParser';

export class ChartAPI {
  public params: Params;
  public chartData: TimeSeriesData;
  public chart: echarts.ECharts;
  public chartOptions: EChartsOption;
  public seriesData: LineSeriesOption[];
  public xAxisOptions: XAXisComponentOption[];
  public yAxisOptions: YAXisComponentOption;

  constructor(params: Params, data: any) {
    this.params = params;
    this.chartData = data;

    // setup chart
    this.chartOptions = setupBaseChart();

    const chartDom = document.querySelector('#chart');

    if (!chartDom) {
      throw new Error('No div found for chart rendering.');
    }

    this.chart = echarts.init(chartDom as HTMLElement);

    // create top xAxis to display timestamps
    const TimeSeries = this.chartData.map((dataPoint) => {
      return dayjs(dataPoint.timestamp).format('DD.MM HH:mm');
    });
    // dummy, replace by currentTimestamp
    const now = TimeSeries.indexOf(dayjs(params.currentTimestamp).format('DD.MM HH:mm'));
    if (!now || now === -1) {
      throw new Error('Could not find current timestamp in available data.');
    };
    const length = TimeSeries.length;

    const xAxis1 = createXaxisOptions({
      data: TimeSeries,
      axisLabel: {
        interval: 7,
        rotate: -30
      }
    });
    // create bottom xAxis to display hours range
    const hoursRange = [];
    for (let i = -now; i <= length - (now + 1); i++) {
      hoursRange.push(`${i}h`);
    }
    hoursRange[now] = 'jetzt';
    const xAxis2 = createXaxisOptions({
      data: hoursRange,
      axisLabel: {
        interval: 7
      }
    });
    this.xAxisOptions = [xAxis2, xAxis1];
    this.yAxisOptions = createYaxisOptions();
    // create series based on chart data
    this.seriesData = [];
    const formattedData = formatChartData(this.chartData);
    Object.entries(formattedData).forEach(([, dataArray], index) => {
      // TODO define right type
      let name: string = '';
      if (index === 0) {
        name = 'Gefühlte Temperatur';
      }
      if (index === 1) {
        name = 'Physikalische Temperatur';
      }
      if (index === 2) {
        name = 'Temperaturdifferenz zum Umland';
      }
      let series = createSeriesData({
        name: name as string,
        data: dataArray.map(dataPoint => {
          return parseFloat(dataPoint[1]).toFixed(1);
        }),
        // TODO make this dependant on data (°C vs Kelvin axis)
        xAxisIndex: 1,
        markLine: {
          symbol: 'none',
          animation: false,
          silent: true,
          label: {
            show: false
          },
          data: [
            {
              xAxis: now,
              lineStyle: {
                color: '#333',
                type: 'solid'
              },
            },
            {
              xAxis: now - 24,
              lineStyle: {
                color: 'lightgrey'
              },
            },
            {
              xAxis: now + 24,
              lineStyle: {
                color: 'lightgrey'
              },
            }
          ]
        }
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
      const thresholdSeries: LineSeriesOption = {
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
    // Create Timestamps for ogc-api-process, round to full hours
    const currentTimestamp = dayjs().format('YYYY-MM-DDTHH:00:00Z');
    const startTimestamp = dayjs().subtract(48, 'hours').format('YYYY-MM-DDTHH:00:00Z');
    const endTimestamp = dayjs().add(48, 'hours').format('YYYY-MM-DDTHH:00:00Z');
    // Append Timestamps to params
    params.currentTimestamp = currentTimestamp;
    params.startTimestamp = startTimestamp;
    params.endTimestamp = endTimestamp;
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
