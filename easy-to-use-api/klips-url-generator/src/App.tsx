import React, { useEffect, useMemo } from 'react';
import { useState } from 'react';

import { optionsRegion, optionsBand, style } from './constants/index.ts'

import GetCoordinatesString from './components/GetCoordinatesString.tsx';
import SelectBand from './components/SelectBand.tsx';
import SelectThreshold from './components/SelectThreshold.tsx';

import MapContext from '@terrestris/react-geo/dist/Context/MapContext/MapContext.js';
import MapComponent from '@terrestris/react-geo/dist/Map/MapComponent/MapComponent.js';

import { CopyOutlined } from '@ant-design/icons'
import { Button, message, Tooltip } from 'antd';

import OlMap from 'ol/Map.js';
import OlView from 'ol/View.js';
import OlLayerTile from 'ol/layer/Tile';
import OlSourceOsm from 'ol/source/OSM';
import OlGeometry from 'ol/geom/Geometry';
import OlFormatWKT from 'ol/format/WKT';
import OlFormatGeoJSON from 'ol/format/GeoJSON';

import { transform } from 'ol/proj.js';

import 'ol/ol.css';
import './style.css';
import "antd/dist/antd.css";

import SelectRegion from './components/SelectRegion.tsx';

import copy from 'copy-to-clipboard';

const App: React.FC = ({
}) => {

  const [region, setRegion] = useState();
  const [band, setBand] = useState(optionsBand[0]);
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

    setMap(new OlMap({
      view: new OlView({
        center: transform([
          13.800524701521447,
          51.05873868269184
        ], 'EPSG:4326', 'EPSG:3857'),
        zoom: 12,
      }),
      layers: [layer]
    }))
  }, []);

  useEffect(() => {
    if (region && wktGeom && threshold && band) {
      setURL(`https://klips-dev.terrestris.de/?region=${region.name.toLowerCase()}&geom=${wktGeom}&threshold=${threshold}&band=${band}`)
    };
  }, [region, wktGeom, threshold, band]);

  const changeRegion = (newRegion: any) => {
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

  function onCopyClick() {
    const success = copy(geoJsonGeom);
    if (success) {
      message.info('GeoJSON wurde zur Zwischenablage hinzugefügt.');
    } else {
      message.info('GeoJSON konnte nicht zur Zwischenablage hinzugeügt werden.');
    }
  }

  return (
    <div className='App'>
      <MapContext.Provider value={map}>
        <div className='output-wrapper'>
          <div className='header'>
            <img src="https://www.klips-projekt.de/wp-content/uploads/2021/02/SAG_KLIPS-Logo_Jan21.png" alt="KLIPS Logo"></img>
            <span>Widget URL Generator</span>
          </div>
          <legend className='heading'>Einstellungen</legend>
          <div className='select-feature-wrapper'>
            <GetCoordinatesString
              name='drawPoint'
              drawType='Point'
              drawStyle={style.point}
              className='button'
              onDrawEnd={onDrawEnd}
              onDrawStart={onDrawStart}
            >
              Punkt
            </GetCoordinatesString>
            <GetCoordinatesString
              name='drawPolygon'
              drawType='Polygon'
              drawStyle={style.polygon}
              className='button'
              onDrawEnd={onDrawEnd}
              onDrawStart={onDrawStart}
            >
              Fläche
            </GetCoordinatesString>
            {!geoJsonGeom ? <></> : <div>
              <div>{geoJsonGeom}</div>
              <Tooltip title='Copy GeoJSON'>
               <Button icon={ <CopyOutlined/>}  onClick={onCopyClick} type='text' /> 
              </Tooltip>
            </div>
            }
          </div>
          <legend className='heading'>Parameter</legend>
          <SelectBand
            inputBands={optionsBand}
            changeBand={changeBand}
          />
          <SelectThreshold
            changeThreshold={changeThreshold}
          />
          <SelectRegion
            inputRegions={optionsRegion}
            onChangeRegion={changeRegion}
            selectedRegion={region}

          />
          <legend className='heading'>URL</legend>
          <div>{url}</div>
        </div>
        <MapComponent
          map={map}
        />
      </MapContext.Provider >
    </div >
  );
};

export default App;
