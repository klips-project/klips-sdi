import { Style, Fill, Stroke, Circle } from 'ol/style';

import langenfeld from '../assets/langenfeld.json'
import dresden from '../assets/dresden.json'
import { Region } from '../types';
import { Feature, FeatureCollection } from 'geojson';
import { GeoJSONFeatureCollection } from 'ol/format/GeoJSON';

export const optionsRegion: Region[] = [
    {
        name: 'Dresden',
        center: [
            13.800524701521447,
            51.05873868269184
        ],
        feature: dresden as FeatureCollection
    },
    {
        name: 'Langenfeld',
        center: [
            6.950600216115337,
            51.11505368291118
        ],
        feature: langenfeld as Feature
    }
];

export const optionsBand = [
    'physical',
    'perceived',
    'difference',
    'compare',
];

export const style = {
    point: new Style({
        image: new Circle({
            radius: 7,
            fill: new Fill({
                color: 'rgb(229, 95, 37, 0.5)',
            }),
            stroke: new Stroke({
                color: 'rgb(229, 95, 37)',
                width: 3,
            }),
        })
    }),
    polygon: new Style({
        fill: new Fill({
            color: 'rgb(229, 95, 37, 0.5)',
        }),
        stroke: new Stroke({
            color: 'rgb(229, 95, 37)',
            width: 3,
        }),
    }),
    feature: new Style({
        stroke: new Stroke({
            color: 'white',
            width: 2,
        }),
    }),
    boundingBox: new Style({
        stroke: new Stroke({
            color: 'rgb(229, 95, 37, 0.5)',
            width: 3,
        }),
    }),
}

export const tiffExtentLangenfeld: GeoJSONFeatureCollection = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            properties: { "id": 1 },
            geometry: {
                type: "MultiPolygon",
                coordinates: [
                    [
                        [
                            [6.907687950004584, 51.140503352290153],
                            [6.99340543001626, 51.142034131492835],
                            [6.996067201372349, 51.083544218560945],
                            [6.910451889506901, 51.082105731788907],
                            [6.907687950004584, 51.140503352290153]
                        ]
                    ]
                ]
            }
        }
    ]
}

export const tiffExtentDresden: GeoJSONFeatureCollection = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            properties: { "id": 1 },
            geometry: {
                type: "MultiPolygon",
                coordinates: [
                    [
                        [
                            [13.580457200134612, 51.153745518273944],
                            [13.959420876068252, 51.157733785182963],
                            [13.963309471306092, 50.977961141084883],
                            [13.585950209065976, 50.973886222145424],
                            [13.580457200134612, 51.153745518273944]
                        ]
                    ]
                ]
            }
        }
    ]
}