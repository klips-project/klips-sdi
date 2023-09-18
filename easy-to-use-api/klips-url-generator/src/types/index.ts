import { Feature, FeatureCollection } from "geojson";

export type Params = {
    server?: string;
    region?: string;
    geom?: string;
    threshold?: string;
    band?: string;
    wktGeometry?: string;
    geoJSONGeometry?: string;
    output?: string;
    title?: string;
};

export type Region = {
    name: string;
    center: number[];
    feature: FeatureCollection | Feature;
};

export type Bands = string[];