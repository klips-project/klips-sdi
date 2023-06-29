export type Params = {
  region?: string;
  geomwkt?: string;
  threshold?: string;
  currentTimestamp?: string;
  startTimestamp?: string;
  endTimestamp?: string;
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

export type BoundaryBox = {
  [property: string]: {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
  }
}

export type Envelope = {
  _minx: number;
  _maxx: number;
  _miny: number;
  _maxy: number;
}
