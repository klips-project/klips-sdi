export type Params = {
  region?: string;
  geomwkt?: string;
  threshold?: string;
};

export type PathNameConfig = {
  [pathName: string]: string;
};

export type TimeSeriesDatapoint = {
  [bandName: string]: string;
  'timestamp': string;
};

export type TimeSeriesData = TimeSeriesDatapoint[];

export type Datapoint = [string, string];

export type DataPointObject = {
  [key: string]: Datapoint[];
};
