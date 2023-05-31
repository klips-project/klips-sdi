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
