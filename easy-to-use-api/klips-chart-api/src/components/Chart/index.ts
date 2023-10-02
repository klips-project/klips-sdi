/* eslint-disable no-console */
import { fetchTimeSeriesData, fetchTimeSeriesDataPolygon, generateErrorMessages } from '../../service/ogc-api-service';
import {
  Params,
  TimeSeriesData
} from '../../types';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);

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
  GraphicComponent,
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
  GraphicComponent,
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
  setupBaseChart,
  legendSelect
} from '../../util/Chart';

import WKTParser from 'jsts/org/locationtech/jts/io/WKTParser';
// @ts-ignore
import GeoJSONWriter from 'jsts/org/locationtech/jts/io/GeoJSONWriter';

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
    };

    this.chart = echarts.init(chartDom as HTMLElement);

    // select band to display
    // changes order of imported array 'legendSelect' implicitly. A default order for legendSelect
    // is declared in '../../util/Chart'. The variable is then used to set legend options for
    // setupBaseChart ('../../util/Chart').
    let lineTypeCompare: string = 'solid';
    if (params.band?.includes('perceived')) {
      [legendSelect[0], legendSelect[1], legendSelect[2]] = [legendSelect[0], legendSelect[1], legendSelect[2]];
    } else if (params.band?.includes('physical')) {
      [legendSelect[0], legendSelect[1], legendSelect[2]] = [legendSelect[1], legendSelect[0], legendSelect[2]];
    } else if (params.band?.includes('difference')) {
      [legendSelect[0], legendSelect[1], legendSelect[2]] = [legendSelect[2], legendSelect[0], legendSelect[1]];
    } else if (params.band?.includes('compare')) {
      [legendSelect[0], legendSelect[1], legendSelect[2]] = [legendSelect[0], legendSelect[0], legendSelect[2]];
      lineTypeCompare = 'dotted';
    };

    // create top xAxis to display timestamps
    let TimeSeries = this.chartData.map((dataPoint) => {
      return dayjs(dataPoint.timestamp).format('DD.MM HH:mm');
    });
    // remove duplicates
    TimeSeries = [...new Set(TimeSeries)];
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
      let lineType: any = '';
      if (index === 0) {
        name = 'Gefühlte Temperatur';
        lineType = lineTypeCompare;
      }
      if (index === 1) {
        name = 'Physikalische Temperatur';
      }
      if (index === 2) {
        name = 'Temperaturdifferenz zum Umland';
        lineType = lineTypeCompare;
      }
      let series = createSeriesData({
        name: name as string,
        lineStyle: { type: lineType },
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
    if (!this.params.threshold) {
      this.params.threshold = '30';
    };

    if (this.params) {
      // define visualMap for chart
      const visualMap = createVisualMap(parseInt(this.params.threshold, 10));
      this.chart.setOption({
        visualMap: visualMap
      });
      // add series to display threshold line and markarea
      const thresholdSeries: LineSeriesOption = {
        name: 'threshold series',
        type: 'line',
        silent: true,
        animation: false,
        markLine: {
          label: {
            show: false
          },
          symbol: 'none',
          itemStyle: {
            color: '#a81a04'
          },
          data: [
            {
              yAxis: parseFloat(this.params.threshold),
            }
          ],
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
        right: 15,
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
    const currentTimestamp = dayjs().utc().format('YYYY-MM-DDTHH:00:00Z');
    const startTimestamp = dayjs().subtract(49, 'hours').utc().format('YYYY-MM-DDTHH:00:00Z');
    const endTimestamp = dayjs().add(49, 'hours').utc().format('YYYY-MM-DDTHH:00:00Z');
    // Append Timestamps to params
    params.currentTimestamp = currentTimestamp;
    params.startTimestamp = startTimestamp;
    params.endTimestamp = endTimestamp;

    // Retrieve chart data from ogc-api-process
    if (!params.geom) {
      return;
    }

    // adapt geometry format
    // if geom-parameter is not given in WKT-format in the url, the parameter is reformatted here.
    if (params.geom.includes('Polygon')) {
      params.geom = 'POLYGON(' +
        JSON.parse(params.geom).coordinates.map(function (ring: any) {
          return '(' + ring.map(function (p: any) {
            return p[0] + ' ' + p[1];
          }).join(', ') + ')';
        }).join(', ') + ')';
    }
    // get wkt Geometry
    const wktReader = new WKTParser();
    const wktGeometry = wktReader.read(params.geom);
    params.wktGeometry = wktGeometry;

    // get GeoJSON
    const geoJSONWriter = new GeoJSONWriter();
    const geoJSONGeometry = geoJSONWriter.write(wktGeometry);
    params.geoJSONGeometry = geoJSONGeometry;

    // validate params
    await generateErrorMessages(params);

    // get data
    let data: TimeSeriesData;
    if (params.geom.includes('POLYGON')) {
      data = await fetchTimeSeriesDataPolygon(params, params.geoJSONGeometry);
    } else {
      data = await fetchTimeSeriesData(params, wktGeometry.getCoordinates()[0]);
    };
    return new ChartAPI(params, data.values);
  }

  render() {
    // this will trigger rendering of chart
    this.chart.setOption(this.chartOptions);
  }

};
