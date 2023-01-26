export interface GeoTiffPublicationJobOptions {
  minTimeStamp: string;
  maxTimeStamp: string;
  timeStampFormat: string;
  allowedDataTypes: string[];
  allowedEPSGCodes: number[];
  expectedBandCount: number;
  fileSize: {
    minFileSize: number;
    maxFileSize: number;
  };
  regions: {
    [key: string]: {
      bbox: string;
    };
  };
  types: string[];
  scenarios: string[];
}

export interface JobConfig {
  geoTiffPublicationJob: GeoTiffPublicationJobOptions;
}
