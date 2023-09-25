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