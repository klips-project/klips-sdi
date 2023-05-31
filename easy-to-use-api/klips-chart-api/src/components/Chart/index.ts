/* eslint-disable no-console */
import { fetchTimeSeriesData } from '../../service/ogc-api-service';
import { Params, TimeSeriesData } from '../../types';

import * as echarts from 'echarts';

export type EChartsOption = echarts.EChartsOption;

export class ChartAPI {
  public params: Params;
  public chartData: any;
  public chart: any;
  public chartOptions: any;

  constructor(params: Params) {
    this.params = params;
    this.chartData = this.getChartData('Peter', [1, 2]);

    this.chartOptions = this.createChartOptions(this.params, this.chartData);

    const chartDom = document.querySelector('#chart');

    if (!chartDom) {
      throw new Error('No div found for chart rendering.');
    }

    this.chart = echarts.init(chartDom as HTMLElement);

  }

  getChartData(
    timestamp: string,
    coordinate: number[]
  ) {
    // Retrieve chart data from ogc-api-process
    // ToDo connect real API
    const data = fetchTimeSeriesData(timestamp, coordinate);
    return data;
  }


  createChartOptions(params: Params, data: TimeSeriesData) {
    console.log('create chart data');
    console.log(params);
    console.log(data);

    // Define threshold
    const threshold: number = params.threshold ? parseInt(params.threshold, 10) : 20;

    const inputHours = ['-48 hours', '-47 hours', '-46 hours', '-45 hours', '-4 hours', '-43 hours', '-42 hours', '-41 hours', '-40 hours', '-39 hours', '-38 hours', '-37 hours', '-36 hours', '-35 hours', '-34 hours', '-33 hours', '-32 hours', '-31 hours', '-30 hours', '-29 hours', '-28 hours', '-27 hours', '-26 hours', '-25 hours', '-24 hours', '-23 hours', '-22 hours', '-21 hours', '-20 hours', '-19 hours', '-18 hours', '-17 hours', '-16 hours', '-15 hours', '-14 hours', '-13 hours', '-12 hours', '-11 hours', '-10 hours', '-9 hours', '-8 hours', '-7 hours', '-6 hours', '-5 hours', '-4 hours', '-3 hours', '-2 hours', '-1 hours', 'now', '1 hours', '2 hours', '3 hours', '4 hours', '5 hours', '6 hours', '7 hours', '8 hours', '9 hours', '10 hours', '11 hours', '12 hours', '13 hours', '14 hours', '15 hours', '16 hours', '17 hours', '18 hours', '19 hours', '20 hours', '21 hours', '22 hours', '23 hours', '24 hours', '25 hours', '26 hours', '27 hours', '28 hours', '29 hours', '30 hours', '31 hours', '32 hours', '33 hours', '34 hours', '35 hours', '36 hours', '37 hours', '38 hours', '39 hours', '40 hours', '41 hours', '42 hours', '43 hours', '44 hours', '45 hours', '46 hours', '47 hours', '48 hours'];

    return {
      title: {
        text: 'Temperature developement for 48h',
        subtext: 'Dummy Data'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'none'
        },
        label: {
          show: false
        }
      },
      grid: {
        top: 75,
        bottom: 100
      },
      legend: {
        data: [
          {
            name: 'perceived temperature',
            icon: 'none'
          },
          {
            name: 'temperature',
            icon: 'none'
          },
          {
            name: 'temperature difference',
            icon: 'none'
          }
        ],
        selectedMode: 'single',

        bottom: 40
      },
      xAxis: [
        {
          type: 'category',
          data: inputHours,
          zlevel: 2,
          axisLine: {
            min: 'dataMin',
            animation: false,
            onZero: false,
            position: "bottom",
            show: true,
            lineStyle: {
              color: 'black',
              width: 1.5,
            },
          },
          axisTick: {
            show: false
          }
        },
        {
          type: 'time',
          position: 'top',
          data: data.map(function (item) {
            return item.timestamp;
          }),
          zlevel: 2,
          axisLine: {
            min: 'dataMin',
            animation: false,
            onZero: false,
            show: true,
            lineStyle: {
              color: 'black',
              width: 1.5,
            },
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            formatter: {
              year: '{yyyy}',
              month: '{MM}'
            }
          }
        },
        {
          position: "bottom",
          data: ["measured", "predicted"],
          axisLine: {
            show: false
          },
          axisLabel: {
            margin: 25
          }
        }
      ],
      yAxis: {
        type: 'value',
        axisLabel: {
          // ToDo adapt formatter for temperature difference
          formatter: '{value} °C'
        },
      },
      toolbox: {
        right: 75,
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          restore: {},
          saveAsImage: {}
        }
      },
      dataZoom: [
        {
          type: 'slider',
          silent: true,
          startValue: '-48 hours',
          endValue: '48 hours',
          fillerColor: 'rgba(0, 0, 0, 0)',
          dataBackground: {
            lineStyle: {
              color: 'lightgrey'
            },
            areaStyle: {
              color: '#f2f2f2'
            }
          },
          selectedDataBackground: {
            lineStyle: {
              color: '#e55f25',
              width: 1,
              shadowColor: 'rgba(0,0,0,0.3)',
              shadowBlur: 10,
              shadowOffsetY: 3
            },
            areaStyle: {
              color: '#e55f25',
              opacity: 0.01
            }
          },
          moveHandleStyle: {
            color: 'none'
          },
          emphasis: {
            moveHandleStyle: {
              color: 'noneS'
            }
          }
        }
      ],
      visualMap: {
        show: false,
        pieces: [
          {
            gt: -100,
            lte: threshold,
            color: '#e55f25'
          },
          {
            gt: threshold,
            lte: 100,
            color: '#a81a04'
          }
        ]
      },
      series: [
        {
          name: 'perceived temperature',
          silent: true,
          type: 'line',
          smooth: false,
          showSymbol: false,
          lineStyle: {
            width: 3,
            shadowColor: 'rgba(0,0,0,0.3)',
            shadowBlur: 10,
            shadowOffsetY: 3
          },
          data: data.map((item) => {
            return item.band_1
          }
          ),
        },
        {
          name: 'temperature',
          silent: true,
          type: 'line',
          smooth: false,
          showSymbol: false,
          lineStyle: {
            width: 3,
            shadowColor: 'rgba(0,0,0,0.3)',
            shadowBlur: 10,
            shadowOffsetY: 3
          },
          data: data.map((item) => {
            return item.band_1
          }
          ),
        },
        {
          name: 'temperature difference',
          silent: true,
          type: 'line',
          smooth: false,
          showSymbol: false,
          lineStyle: {
            width: 3,
            shadowColor: 'rgba(0,0,0,0.3)',
            shadowBlur: 10,
            shadowOffsetY: 3
          },
          data: data.map((item) => {
            return item.band_1
          }
          ),
        },
        {
          name: 'vertical line',
          type: 'line',
          silent: true,
          markArea: {
            itemStyle: {
              color: '#f2f2f2',
              opacity: 0.5,
              z: 0
            },
            data: [
              [
                {
                  xAxis: '-48 hours'
                },
                {
                  xAxis: '-24 hours'
                }
              ],
              [
                {
                  xAxis: '24 hours'
                },
                {
                  xAxis: '48 hours'
                }
              ],
            ]
          },
          markLine: {
            symbol: 'none',
            animation: false,
            silent: true,
            label: {
              normal: {
                distance: -18,
                position: 'end',
                show: true
              }
            },
            lineStyle: {
              color: '#333'
            },
            data: [
              {
                xAxis: 'now'
              },
            ]
          }
        },
        {
          name: 'horizontal line',
          type: 'line',
          animation: false,
          markArea: {
            itemStyle: {
              color: '#a81a04',
              opacity: 0.05,
              z: 1
            },
            data: [
              [
                {
                  yAxis: threshold
                },
                {
                  yAxis: 100
                }
              ],
            ]
          },
          markLine: {
            symbol: 'none',
            label: {
              normal: {
                show: false
              }
            },
            lineStyle: {
              color: '#333'
            },
            data: [
              {
                yAxis: threshold
              }
            ]
          }
        }
      ]
    };
  }

  render() {
    // this will trigger rendering of chart
    this.chart.setOption(this.chartOptions);
  }

};
