import React, { useEffect, useMemo } from 'react';
import { useState } from 'react';

import { optionsRegion, style, optionsWidget } from './constants'

import MapContext from '@terrestris/react-geo/dist/Context/MapContext/MapContext.js';
import MapComponent from '@terrestris/react-geo/dist/Map/MapComponent/MapComponent.js';

import OlMap from 'ol/Map.js';
import OlView from 'ol/View.js';
import OlLayerTile from 'ol/layer/Tile';
import OlSourceOsm from 'ol/source/OSM';
import OlGeometry from 'ol/geom/Geometry';
import OlFormatWKT from 'ol/format/WKT';
import OlVectorLayer from 'ol/layer/Vector.js';
import OlVectorSource from 'ol/source/Vector.js';
import OlFormatGeoJSON from 'ol/format/GeoJSON';

import { transform } from 'ol/proj.js';

import 'ol/ol.css';
import './style.css';
import "antd/dist/antd.css";

import SelectRegion from './components/SelectRegion'

import PhotonSearch from './components/PhotonSearch';
import SelectWidget from './components/SelectWidget';
import ChartComponent from './components/ChartComponent';
import VideoComponent from './components/VideoComponent';
import WarningComponent from './components/WarningComponent';

const App: React.FC = () => {

  const [region, setRegion] = useState<string>('');
  const [geom, setGeom] = useState<OlGeometry | null>(null);
  const [map, setMap] = useState<OlMap>();
  const [widget, setWidget] = useState<string>('');

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

  const changeRegion = (newRegion: string) => {
    setRegion(newRegion);
  };

  const onDrawEnd = (geom: OlGeometry) => {
    setGeom(geom);
  };

  // const onDrawStart = () => {
  //   setIsLegal(true);
  // };

  const changeWidget = (newWidget: string) => {
    setWidget(newWidget);
  };

  if (!map) {
    return <></>;
  };

  const getWidget = () => {
    switch (widget) {
      case 'chart':
        return <ChartComponent
          geoJsonGeom={geoJsonGeom}
          region={region}
          wktGeom={wktGeom}
          onDrawEnd={onDrawEnd}
          // onDrawStart={onDrawStart}
        />
      case 'video':
        return <VideoComponent
          geoJsonGeom={geoJsonGeom}
          region={region}
          onDrawEnd={onDrawEnd}
          // onDrawStart={onDrawStart}
        />
      case 'warning':
        return <WarningComponent
          wktGeom={wktGeom}
          geoJsonGeom={geoJsonGeom}
          region={region}
          onDrawEnd={onDrawEnd}
          // onDrawStart={onDrawStart}
        />
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
          <PhotonSearch />
          <SelectRegion
            inputRegions={optionsRegion}
            onChangeRegion={changeRegion}
            regionName={region}
          />
          <SelectWidget
            changeWidget={changeWidget}
            selectedWidget={widget}
            inputWidget={optionsWidget}
          />
          {getWidget()}
        </div>
        <MapComponent
          map={map}
        />
      </MapContext.Provider >
    </div >
  );
};

export default App;
