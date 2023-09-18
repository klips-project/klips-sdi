import React, { useEffect } from 'react';
import { useState } from 'react';

import { layer, optionsRegion, optionsBand, style } from './constants/index.js'

import GetCoordinatesString from './components/GetCoordinatesString.tsx';
import SelectParams from './components/SelectParams.tsx';

import MapContext from '@terrestris/react-geo/dist/Context/MapContext/MapContext.js';
import MapComponent from '@terrestris/react-geo/dist/Map/MapComponent/MapComponent.js';

import OlMap from 'ol/Map.js';
import OlView from 'ol/View.js';
import OlVectorLayer from 'ol/layer/Vector.js';
import OlVectorSource from 'ol/source/Vector.js';
import OlFormatGeoJSON from 'ol/format/GeoJSON.js';

import { transform } from 'ol/proj.js';

import 'ol/ol.css';
import './style.css';

function App() {

  const [region, setRegion] = useState(optionsRegion[0]);
  const [band, setBand] = useState(optionsBand[0]);
  const [threshold, setThreshold] = useState('25');
  const [output, setOutput] = useState('');
  const [map, setMap] = useState<OlMap>();

  useEffect(() => {
    // create map layers
    const format = new OlFormatGeoJSON({
      featureProjection: 'EPSG:3857'
    });
    const features = format.readFeatures(region.feature);

    const layerFeatures = new OlVectorLayer({
      source: new OlVectorSource({
        features
      }),
      style: style.feature,
    });

    // create map
    setMap(new OlMap({
      view: new OlView({
        center: transform(region.center, 'EPSG:4326', 'EPSG:3857'),
        zoom: 12,
      }),
      layers: [layer, layerFeatures]
    }))

    // wenn sich die region ändert soll nur das view neu gesetzt werden
  }, [])

  useEffect(() => {

  }, [region])

  const changeRegion = (newRegion: any) => {
    setRegion(newRegion);
  }

  const changeBand = (newBand: string) => {
    setBand(newBand);
  }

  const changeThreshold = (newThreshold: any) => {
    setThreshold(newThreshold);
  }

  const onDrawEnd = (wktOutput: string) => {
    setOutput(wktOutput);
    console.log(wktOutput);
  }

  if (!map) {
    return <></>;
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
            inputRegions={optionsRegion}
            inputBands={optionsBand}
            changeRegion={changeRegion}
            changeBand={changeBand}
            changeThreshold={changeThreshold}
          ></SelectParams>
          <legend className='heading'>URL</legend>
          <table className='link-wrapper'>
            <tr><a href={`https://klips-dev.terrestris.de/?region=${region.name.toLowerCase()}&geom=${output}&threshold=${threshold}&band=${band}`}>
              https://klips-dev.terrestris.de/?region={region.name.toLowerCase()}&geom={output}&threshold={threshold}&band={band}</a></tr>
            <tr><td>{`<iframe src="https://klips-dev.terrestris.de/?region=${region.name.toLowerCase()}&geom=${output}&threshold=${threshold}&band=${band}" />`}</td></tr>
          </table>
        </div>
        <MapComponent
          map={map}
        />
      </MapContext.Provider>
    </div>
  );
}

export default App;
