import React, { useEffect, useMemo } from 'react';
import { useState } from 'react';

import { optionsRegion, optionsBand, style } from './constants/index.ts'

import GetCoordinatesString from './components/DrawGeometry.tsx';
import SelectBand from './components/SelectBand.tsx';
import SelectThreshold from './components/SelectThreshold.tsx';

import MapContext from '@terrestris/react-geo/dist/Context/MapContext/MapContext.js';
import MapComponent from '@terrestris/react-geo/dist/Map/MapComponent/MapComponent.js';

import { CopyOutlined } from '@ant-design/icons'
import { Button, Input, message, Tooltip } from 'antd';

import OlMap from 'ol/Map.js';
import OlView from 'ol/View.js';
import OlLayerTile from 'ol/layer/Tile';
import OlSourceOsm from 'ol/source/OSM';
import OlGeometry from 'ol/geom/Geometry';
import OlFormatWKT from 'ol/format/WKT';
import OlFormatGeoJSON from 'ol/format/GeoJSON';
import OlVectorLayer from 'ol/layer/Vector.js';
import OlVectorSource from 'ol/source/Vector.js';

import { transform } from 'ol/proj.js';

import 'ol/ol.css';
import './style.css';
import "antd/dist/antd.css";

import SelectRegion from './components/SelectRegion.tsx';

import copy from 'copy-to-clipboard';
import TextArea from 'antd/lib/input/TextArea';
import BasicNominatimSearch from './components/BasicNominatimSearch.tsx';

const App: React.FC = () => {

  const [region, setRegion] = useState<string | undefined>();
  const [band, setBand] = useState('');
  const [threshold, setThreshold] = useState();
  const [geom, setGeom] = useState<OlGeometry | null>(null);
  const [map, setMap] = useState<OlMap>();
  const [url, setURL] = useState('')

  const wktGeom = useMemo(() => {
    if (!geom) {
      return ''
    };
    const formatWKT = new OlFormatWKT();
    return formatWKT.writeGeometry(geom);
  }, [geom])

  const geoJsonGeom = useMemo(() => {
    if (!geom) {
      return ''
    };
    const formatGeoJSON = new OlFormatGeoJSON();
    return formatGeoJSON.writeGeometry(geom);
  }, [geom])

  useEffect(() => {
    // create map
    const layer = new OlLayerTile({
      source: new OlSourceOsm({
      }
      )
    });

    // create empty vector layer
    const tiffExtentVectorLayer = new OlVectorLayer({
      source: new OlVectorSource(),
      style: style.boundingBox
  });
  tiffExtentVectorLayer.set('name', 'BboxLayer');

    setMap(new OlMap({
      view: new OlView({
        center: transform([
          13.800524701521447,
          51.05873868269184
        ], 'EPSG:4326', 'EPSG:3857'),
        zoom: 12,
      }),
      layers: [layer, tiffExtentVectorLayer]
    }))    
  }, []);

  useEffect(() => {
    if (region && wktGeom && threshold && band) {
      setURL(`https://klips-dev.terrestris.de/?region=${region.toLowerCase()}&geom=${wktGeom}&threshold=${threshold}&band=${band}`)
    };
  }, [region, wktGeom, threshold, band]);

  const changeRegion = (newRegion: string) => {
    setRegion(newRegion);
  };

  const changeBand = (newBand: string) => {
    setBand(newBand);
  };

  const changeThreshold = (newThreshold: any) => {
    setThreshold(newThreshold);
  };

  const onDrawEnd = (geom: OlGeometry) => {
    setGeom(geom);
  };

  const onDrawStart = () => {
  };

  if (!map) {
    return <></>;
  };

  function onCopyClickGeom() {
    const success = copy(geoJsonGeom);
    if (success) {
      message.info('GeoJSON wurde zur Zwischenablage hinzugefügt.');
    } else {
      message.info('GeoJSON konnte nicht zur Zwischenablage hinzugeügt werden.');
    }
  }

  function onCopyClickUrl() {
    const success = copy(url);
    if (success) {
      message.info('URL wurde zur Zwischenablage hinzugefügt.');
    } else {
      message.info('URL konnte nicht zur Zwischenablage hinzugeügt werden.');
    }
  }

  return (
    <div className='App'>
      <MapContext.Provider value={map}>
        <div className='output-wrapper'>
          <div className='header'>
            <img src="https://www.klips-projekt.de/wp-content/uploads/2021/02/SAG_KLIPS-Logo_Jan21.png" alt="KLIPS Logo"></img>
            <h2>Widget URL Generator</h2>
          </div>
          <BasicNominatimSearch className='nominatim-search' />
          <SelectRegion
            inputRegions={optionsRegion}
            onChangeRegion={changeRegion}
            regionName={region}
          />
          <div className='geometry'>
            <GetCoordinatesString
              drawType='Point'
              drawStyle={style.point}
              onDrawEnd={onDrawEnd}
              onDrawStart={onDrawStart}
            />
            <GetCoordinatesString
              drawType='Polygon'
              drawStyle={style.polygon}
              onDrawEnd={onDrawEnd}
              onDrawStart={onDrawStart}
            />
            {!geoJsonGeom ? <></> :
              <div>
                <TextArea
                  readOnly
                  value={geoJsonGeom}
                />
                <Tooltip
                  title='Copy GeoJSON'
                >
                  <Button
                    icon={<CopyOutlined />}
                    onClick={onCopyClickGeom}
                    type='text'
                  />
                </Tooltip>
              </div>
            }
          </div>
          <div className='attributes'>
            <SelectBand
              inputBands={optionsBand}
              changeBand={changeBand}
              selectedBand={band}
            />
            <SelectThreshold
              changeThreshold={changeThreshold}
            />

          </div>
          <div className='permalink'>
            <Input
              readOnly
              value={url}
            />
            <Tooltip
              title='Copy GeoJSON'
            >
              <Button
                icon={<CopyOutlined />}
                onClick={onCopyClickUrl}
                type='text'
              />
            </Tooltip>
          </div>
        </div>
        <MapComponent
          map={map}
        />
      </MapContext.Provider >
    </div >
  );
};

export default App;
