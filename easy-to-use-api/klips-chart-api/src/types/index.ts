export type Params = {
  widget?: string;
  region?: string;
  geomwkt?: string;
  threshold?: string;
};

export type PathNameConfig = {
  [pathName: string]: string;
};

export type TimeSeriesDatapoint = {
  'band_1': string;
  'timestamp': string;
};

export type TimeSeriesData = TimeSeriesDatapoint[];

export type Datapoint = [string, string];

export type DataPointObject = {
  [key: string]: Datapoint[];
};

export type EChartsOption = echarts.EChartsOption;
export type EChart = echarts.ECharts;
export type EChartsLineSeriesOption = echarts.LineSeriesOption;
export type EChartsXaxisOption = echarts.XAXisComponentOption;
export type EChartsYaxisOption = echarts.YAXisComponentOption;
