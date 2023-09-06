import OlLayerTile from 'ol/layer/Tile';
import OlSourceOsm from 'ol/source/OSM';

import langenfeld from '../assets/langenfeld.json'
import dresden from '../assets/dresden.json'

export const layer = new OlLayerTile({
    source: new OlSourceOsm()
});

export const optionsRegion = [
    {
        name: 'Dresden',
        center: [
            13.713524701521447,
            51.03873868269184
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
