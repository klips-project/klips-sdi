import * as React from 'react';
import { useEffect, useState } from 'react';

import OlFormatGeoJSON from 'ol/format/GeoJSON';
import OlVectorLayer from 'ol/layer/Vector.js';
import OlVectorSource from 'ol/source/Vector.js';

import { style } from '../constants/index.ts'
import { transform } from 'ol/proj.js';

import MapUtil from '@terrestris/ol-util/dist/MapUtil/MapUtil.js';

import {
    useMap
} from '@terrestris/react-geo/dist/Hook/useMap';
import { Region } from '../types/index.js';

export interface RegionProps {
    inputRegions: Region[];

    onChangeRegion?: (newRegion: any) => void;

    selectedRegion?: any;
};

export type SelectRegionProps = RegionProps;

const SelectRegion: React.FC<SelectRegionProps> = ({ inputRegions, onChangeRegion, selectedRegion }) => {
    const [open, setOpen] = useState(false);

    const map = useMap();

    useEffect(() => {
        console.log(selectedRegion);
        // create map layers
        if (!map || !selectedRegion) {
            return;
        };
        let vectorLayer = MapUtil.getLayerByName(map, 'RegionLayer') as OlVectorLayer<OlVectorSource>;
        if (!vectorLayer) {
            // create empty vector layer
            vectorLayer = new OlVectorLayer({
                source: new OlVectorSource(),
                style: style.feature,
            });
            vectorLayer.set('name', 'RegionLayer');
            map?.addLayer(vectorLayer);
        };

        const format = new OlFormatGeoJSON({
            featureProjection: 'EPSG:3857'
        });

        // add features to layer
        const features = format.readFeatures(selectedRegion.feature);
        vectorLayer.getSource()?.addFeatures(features);
        // update map center
        map?.getView()?.setZoom(12);
        map?.getView()?.setCenter(transform(selectedRegion.center, 'EPSG:4326', 'EPSG:3857'));

        return (() => { vectorLayer.getSource()?.clear() })
    }, [selectedRegion]);

    // Menu handler 
    const handleMenuRegion = (input: any) => {
        onChangeRegion?.(input);
    }

    const handleOpen = () => {
        setOpen(!open);
    };

    const optionsRegion = inputRegions.map((region) =>
        <li key={region.name} onClick={() => handleMenuRegion(region)}>{region.name}</li>
    );

    return (
        <div className='select-params-wrapper'>
            <div className={'dropdown'}>
                {selectedRegion ? <></> :
                    <div>Please select a region! Bitte wählen Sie eine Region!</div>
                }
                <button onClick={handleOpen} className={'button'}>Region</button>
                <div className={'dropdown-content'}><ul>{optionsRegion}</ul></div >
            </div>
        </div>
    );
};

export default SelectRegion;
