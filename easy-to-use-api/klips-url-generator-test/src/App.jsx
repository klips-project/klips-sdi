import React from 'react';
import { useState } from 'react';

import { layer, optionsRegion, optionsBand } from './constants/index.js'

import GetCoordinatesString from './components/GetCoordinatesString.tsx';
import SelectParams from './components/SelectParams.tsx';

import MapContext from '@terrestris/react-geo/dist/Context/MapContext/MapContext';
import MapComponent from '@terrestris/react-geo/dist/Map/MapComponent/MapComponent';
import ToggleGroup from '@terrestris/react-geo/dist/Button/ToggleGroup/ToggleGroup';

import OlMap from 'ol/Map';
import OlView from 'ol/View';
import OlVectorLayer from 'ol/layer/Vector';
import OlVectorSource from 'ol/source/Vector';
import OlFormatGeoJSON from 'ol/format/GeoJSON';

import 'ol/ol.css';
import './style.css';

function App() {

  const [param, setParams] = useState(optionsRegion[0]);

  const changeParams = (newParam) => {
    setParams(newParam);
  }

  const [band, setBand] = useState(optionsBand[0]);

  const changeBand = (newBand) => {
    setBand(newBand);
  }

  const [output, setOutput] = useState('no feature drawn yet');

  const passOutput = (wktOutput) => {
    setOutput(wktOutput);
  }

  // create map layers
  const format = new OlFormatGeoJSON();
  const features = format.readFeatures(param.feature);


  const layerFeatures = new OlVectorLayer({
    source: new OlVectorSource({
      features
    })
  });

  // create map
  const map = new OlMap({
    view: new OlView({
      center: param.center,
      zoom: 13,
      projection: 'EPSG:4326'
    }),
    layers: [layer, layerFeatures]
  });


  if (!map) {
    return null;
  }

  return (
    <div className='App'>
      <MapContext.Provider value={map}>
        <MapComponent
          map={map}
          style={{
            height: '70%'
          }}
        />
        <div className='output-wrapper'>
          <ToggleGroup>
            <GetCoordinatesString
              name='drawPoint'
              drawType='Point'
              className='button-wrapper'
              passOutput={passOutput}
            >
              Point
            </GetCoordinatesString>
            <GetCoordinatesString
              name='drawPolygon'
              drawType='Polygon'
              className='button-wrapper'
              passOutput={passOutput}
            >
              Polygon
            </GetCoordinatesString>
          </ToggleGroup>
          <SelectParams
            inputRegions={optionsRegion}
            inputBands={optionsBand}
            changeParams={changeParams}
            changeBand={changeBand}
          ></SelectParams>
          <span> Region: {param.name}</span>
          <span>https://klips-dev.terrestris.de/?region={param.name.toLowerCase()}&geom={output}&threshold=&band=</span>
        </div>
      </MapContext.Provider>
    </div>
  );
}

export default App;