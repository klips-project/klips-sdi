import {
  DataPointObject,
  TimeSeriesData,
  BoundingBox,
  LegendSelect,
} from '../types';

// import echart types
import {
  LineSeriesOption,
  XAXisComponentOption,
  YAXisComponentOption,
} from 'echarts';

// check geometry
export const pointInRect = (
  inputBbox: BoundingBox,
  point: any
): boolean => {
  // get bbox of for input point
  const envelope = point.getEnvelopeInternal();
  return (
    envelope.getMinX() > inputBbox[0] &&
    envelope.getMinY() > inputBbox[1] &&
    envelope.getMaxX() < inputBbox[2] &&
    envelope.getMaxY() < inputBbox[3]
  );
};

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
      rotate: -45
    }
  };
  return { ...option, ...inputOptions };
};

export const createSeriesData = (inputOptions?: LineSeriesOption): LineSeriesOption => {
  let option: LineSeriesOption;
  option = {
    type: 'line',
    silent: false,
    showSymbol: false,
    xAxisIndex: 1,
    lineStyle: {
      width: 3,
      shadowColor: 'rgba(0,0,0,0.3)',
      shadowBlur: 10,
      shadowOffsetY: 3
    },
  };
  return { ...option, ...inputOptions };
};

export const formatChartData = (data: TimeSeriesData): DataPointObject => {
  const result: DataPointObject = {};
  // for point geometry
  if (!data[0].band) {
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
      // for polygon geometry
      // output structure of the ogc-api-process zonal-statistics-time-rasterstats
      // gives output as individual objects for each band. Thus the output data is restructured here.
    });
  } else {
    data.map(band => band.band)
      .filter((value, index, self) => self.indexOf(value) === index) // get number of bands
      .forEach(value => {
        result[value] = data.filter(item => item.band === value) // filter data array by each band number
          .map(item => [item.timestamp, item.mean]); // map the correct parameters to each object
      });
  }
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

export const legendSelect: LegendSelect = [
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
    icon: 'none',
  }
];

export const setupBaseChart = (): echarts.EChartsOption => {
  return {
    title: {
      text: 'Temperaturentwicklung der vergangenen und folgenden 48 Stunden',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: legendSelect,
      selectedMode: 'single',
      bottom: 50,
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
      onclick: function () { window.open('http://www.klips-projekt.de/'); },
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
        xAxisIndex: [1, 0],
        fillerColor: 'rgba(0, 0, 0, 0)',
        dataBackground: {
          lineStyle: {
            color: 'lightgrey'
          },
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
      },
    ]
  };
};
