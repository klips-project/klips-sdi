import React, { useEffect } from 'react';
import { useState } from 'react';

import { optionsRegion, optionsBand, style } from './constants/index.ts'

import GetCoordinatesString from './components/GetCoordinatesString.tsx';
import SelectParams from './components/SelectParams.tsx';

import MapContext from '@terrestris/react-geo/dist/Context/MapContext/MapContext.js';
import MapComponent from '@terrestris/react-geo/dist/Map/MapComponent/MapComponent.js';

import OlMap from 'ol/Map.js';
import OlView from 'ol/View.js';
import OlLayerTile from 'ol/layer/Tile';
import OlSourceOsm from 'ol/source/OSM';

import { transform } from 'ol/proj.js';

import 'ol/ol.css';
import './style.css';
import SelectRegion from './components/SelectRegion.tsx';

const App: React.FC = ({
}) => {

  const [region, setRegion] = useState();
  const [band, setBand] = useState(optionsBand[0]);
  const [threshold, setThreshold] = useState('25');
  const [output, setOutput] = useState('');
  const [map, setMap] = useState<OlMap>();
  const [url, setURL] = useState('')

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
    if (region && output && threshold && band) {
      setURL(`https://klips-dev.terrestris.de/?region=${region.name.toLowerCase()}&geom=${output}&threshold=${threshold}&band=${band}`)
    };
  }, []);

  const changeRegion = (newRegion: any) => {
    setRegion(newRegion);
  };

  const changeBand = (newBand: string) => {
    setBand(newBand);
  };

  const changeThreshold = (newThreshold: any) => {
    setThreshold(newThreshold);
  };

  const onDrawEnd = (wktOutput: string) => {
    setOutput(wktOutput);
    console.log(wktOutput);
  };

  if (!map) {
    return <></>;
  };

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
            >
              Punkt
            </GetCoordinatesString>
            <GetCoordinatesString
              name='drawPolygon'
              drawType='Polygon'
              drawStyle={style.polygon}
              className='button'
              onDrawEnd={onDrawEnd}
            >
              Fläche
            </GetCoordinatesString>
          </div>
          <legend className='heading'>Parameter</legend>
          <SelectParams
            inputBands={optionsBand}
            changeBand={changeBand}
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
