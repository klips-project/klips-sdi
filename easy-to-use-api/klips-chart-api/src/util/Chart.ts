import {
  DataPointObject,
  TimeSeriesData
} from '../types';

// import echart types
import {
  LineSeriesOption,
  XAXisComponentOption,
  YAXisComponentOption,
} from 'echarts';

export const createYaxisOptions = (): YAXisComponentOption => {
  let option: YAXisComponentOption;
  option = {
    type: 'value',
    axisLabel: {
      // ToDo adapt formatter for temperature difference
      formatter: '{value} °C'
    },
  };
  return option;
};

export const createXaxisOptions = (inputOptions?: XAXisComponentOption): XAXisComponentOption => {
  let option: XAXisComponentOption;
  option = {
    type: 'category',
    boundaryGap: false,
    // set z to 2 to overlap markAreas
    z: 2,
    axisLine: {
      onZero: false,
      lineStyle: {
        color: 'black',
        width: 1.5,
      },
    },
    axisLabel: {
      hideOverlap: false,
      showMinLabel: true,
      showMaxLabel: true,
      rotate: -45,
      formatter: '{dd}.{MM} {HH}:{mm}'
    }
  };
  return { ...option, ...inputOptions };
};

export const createSeriesData = (inputOptions?: LineSeriesOption): LineSeriesOption => {
  let option: LineSeriesOption;
  option = {
    type: 'line',
    silent: false,
    showSymbol: true,
    lineStyle: {
      width: 3,
      shadowColor: 'rgba(0,0,0,0.3)',
      shadowBlur: 10,
      shadowOffsetY: 3
    },
    markLine: {
      symbol: 'none',
      animation: false,
      silent: true,
      label: {
        show: false
      },
      data: [
        {
          xAxis: 48,
          lineStyle: {
            color: '#333',
            type: 'solid'
          },
        },
        {
          xAxis: 24,
          lineStyle: {
            color: 'lightgrey'
          },
        },
        {
          xAxis: 72,
          lineStyle: {
            color: 'lightgrey'
          },
        }
      ]
    }
  };
  return { ...option, ...inputOptions };
};

export const formatChartData = (data: TimeSeriesData): DataPointObject => {
  const result: DataPointObject = {};
  data.forEach(obj => {
    Object.keys(obj).forEach((key, index) => {
      if (key !== 'timestamp') {
        if (!result[key]) {
          result[key] = [];
        }
        result[key].push([
          obj.timestamp,
          obj[`band_${index + 1}`]
        ]
        );
      }
    });
  });
  return result;
};

export const createVisualMap = (threshold: number): echarts.VisualMapComponentOption => {
  return {
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
    ],
    // hide legend for visualMap
    show: false,
  };
};

export const setupBaseChart = (): echarts.EChartsOption => {
  return {
    title: {
      text: 'Temperaturentwicklung der vergangenen und folgenden 48 Stunden',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: [
        {
          name: 'Gefühlte Temperatur',
          icon: 'none'
        },
        {
          name: 'Physikalische Temperatur',
          icon: 'none'
        },
        {
          name: 'Temperaturdifferenz zum Umland',
          icon: 'none'
        }
      ],
      selectedMode: 'single',
      bottom: 50
    },
    xAxis: [],
    yAxis: [],
    series: [],
    grid: {
      top: 100,
      bottom: 100
    },
    graphic: [{
      type: 'image',
      onclick:  function () { window.open('http://www.klips-projekt.de/'); },
      style: {
        x: 8,
        y: 20,
        height: 40,
        image: 'https://www.klips-projekt.de/wp-content/uploads/2021/02/SAG_KLIPS-Logo_Jan21.png',
      },
    },
    ],
    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: 1,
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
            color: 'none'
          }
        }
      }
    ]
  };
};
