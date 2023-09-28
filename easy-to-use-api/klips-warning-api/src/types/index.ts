export type Params = {
    region?: string;
    geom?: string;
    thresholdgreen?: string;
    thresholdorange?: string;
    thresholdred?: string;
    band?: string;
};

export type NotificationInput = {
    name: String,
    color: String,
    notification: String,
    text: String,
};

export type ResultObject = {
    band_1: Number,
    band_2: Number,
    band_3: Number,
    timestamp: any,
}

export type ResultThreshold = {
    green: ResultObject[],
    orange: ResultObject[],
    red: ResultObject[],
}
