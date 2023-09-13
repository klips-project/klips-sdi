import OlLayerTile from 'ol/layer/Tile';
import OlSourceOsm from 'ol/source/OSM';

import { Style, Fill, Stroke, Circle } from 'ol/style';

import langenfeld from '../assets/langenfeld.json'
import dresden from '../assets/dresden.json'

export const layer = new OlLayerTile({
    name: 'OSM',
    source: new OlSourceOsm({
    }
    )
});

export const optionsRegion = [
    {
        name: 'Dresden',
        center: [
            13.800524701521447,
            51.05873868269184
        ],
        feature: dresden
    },
    {
        name: 'Langenfeld',
        center: [
            6.950600216115337,
            51.11505368291118
        ],
        feature: langenfeld
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
        fill: new Fill({
            color: 'rgb(255, 255, 255, 0.5)',
        }),
        stroke: new Stroke({
            color: 'white',
            width: 3,
        }),
    }),
}
