import * as React from 'react';
import { useEffect } from 'react';

import OlFormatGeoJSON from 'ol/format/GeoJSON';
import OlVectorLayer from 'ol/layer/Vector.js';
import OlVectorSource from 'ol/source/Vector.js';

import { tiffExtentDresden, tiffExtentLangenfeld, optionsRegion, style } from '../../constants'
import { transform } from 'ol/proj.js';

import MapUtil from '@terrestris/ol-util/dist/MapUtil/MapUtil.js';

import {
    useMap
} from '@terrestris/react-geo/dist/Hook/useMap';
import { Region } from '../../types/index.js';
import { Select } from 'antd';

export interface RegionProps {
    inputRegions: Region[];

    onChangeRegion?: (newRegion: any) => void;

    regionName: string | undefined;
};

export type SelectRegionProps = RegionProps;

const SelectRegion: React.FC<SelectRegionProps> = ({ inputRegions, onChangeRegion, regionName }) => {
    const map = useMap();

    useEffect(() => {
        // create map layers
        if (!map || !regionName) {
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
        const myRegion = optionsRegion.find((region) => region.name === regionName)
        if (!myRegion) {
            return
        }
        const features = format.readFeatures(myRegion?.feature);
        vectorLayer.getSource()?.addFeatures(features);


        // new vectorlayer for bbox
        let tiffExtentVectorLayer = MapUtil.getLayerByName(map, 'BboxLayer') as OlVectorLayer<OlVectorSource>;
        if (tiffExtentVectorLayer) {
            tiffExtentVectorLayer.getSource()?.clear();
        };

        let searchRestultsVectorLayer = MapUtil.getLayerByName(map, 'SearchResults') as OlVectorLayer<OlVectorSource>;
        if (searchRestultsVectorLayer) {
            searchRestultsVectorLayer.getSource()?.clear();
        }

        const tiffExtentformat = new OlFormatGeoJSON({
            featureProjection: 'EPSG:3857'
        });

        let tiffExtentFeatures;

        if (regionName === "Langenfeld") {
            tiffExtentFeatures = tiffExtentformat.readFeatures(tiffExtentLangenfeld);
        }
        else if (regionName === "Dresden") {
            tiffExtentFeatures = tiffExtentformat.readFeatures(tiffExtentDresden);
        }
        if (tiffExtentFeatures) {
            tiffExtentVectorLayer.getSource()?.addFeatures(tiffExtentFeatures);
        }

        // update map center
        map.getView().setZoom(12);
        map?.getView()?.setCenter(transform(myRegion?.center, 'EPSG:4326', 'EPSG:3857'));

        return (() => { vectorLayer.getSource()?.clear() })
    }, [regionName, map]);

    const selectOptions = React.useMemo(() => {
        return inputRegions.map((region) => {
            return {
                'value': region.name,
                'label': region.name
            };
        })
    }, [inputRegions])

    return (
        <div className='region-selector'>
            {regionName ? <></> :
                <div>Bitte wählen Sie eine Region aus</div>
            }
            <Select
                className={'button'}
                options={selectOptions}
                onChange={onChangeRegion}
                placeholder='Region'
            />
        </div>
    );
};

export default SelectRegion;
