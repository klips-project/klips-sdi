export interface GeoTiffPublicationJobOptions {
  minTimeStamp: string;
  maxTimeStamp: string;
  timeStampFormat: string;
  allowedDataTypes: string[];
  allowedEPSGCodes: number[];
  expectedBandCount: number;
  expectedNoDataValue: number;
  valueRange: {
    expectedBandRanges: [{
      min: number;
      max: number;
    }];
  };
  fileSize: {
    minFileSize: number;
    maxFileSize: number;
  };
  regions: {
    [key: string]: {
      bbox: string;
    };
  };
  scenarios: string[];
}

export interface JobConfig {
  geoTiffPublicationJob: GeoTiffPublicationJobOptions;
}
