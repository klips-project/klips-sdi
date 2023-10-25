import React, { useEffect, useMemo } from 'react';
import { useState } from 'react';

import { optionsRegion, style, optionsWidget } from './constants'

import MapContext from '@terrestris/react-geo/dist/Context/MapContext/MapContext.js';
import MapComponent from '@terrestris/react-geo/dist/Map/MapComponent/MapComponent.js';
import MapUtil from '@terrestris/ol-util/dist/MapUtil/MapUtil.js';

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
import "antd/dist/antd.variable.min.css";

import SelectRegion from './components/SelectRegion'

import PhotonSearch from './components/PhotonSearch';
import SelectWidget from './components/SelectWidget';
import ChartComponent from './components/ChartComponent';
import VideoComponent from './components/VideoComponent';
import WarningComponent from './components/WarningComponent';
import { ConfigProvider } from 'antd';

const App: React.FC = () => {

  const [region, setRegion] = useState<string>('Dresden');
  const [geom, setGeom] = useState<OlGeometry | null>(null);
  const [map, setMap] = useState<OlMap>();
  const [widget, setWidget] = useState<string>('');

  const wktGeom = useMemo(() => {
    if (!geom) {
      return ''
    };
    const formatWKT = new OlFormatWKT();
    return formatWKT.writeGeometry(geom.clone().transform('EPSG:3857', 'EPSG:4326'));
  }, [geom])

  const geoJsonGeom = useMemo(() => {
    if (!geom) {
      return ''
    };
    const formatGeoJSON = new OlFormatGeoJSON();
    return formatGeoJSON.writeGeometry(geom.clone().transform('EPSG:3857', 'EPSG:4326'));
  }, [geom])

  useEffect(() => {
    // create map
    const layer = new OlLayerTile({
      source: new OlSourceOsm({
      })
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

  ConfigProvider.config({
    theme: {
      primaryColor: '#e45f24'
    }
  });

  const changeRegion = (newRegion: string) => {
    setRegion(newRegion);
  };

  const onDrawEnd = (geom: OlGeometry) => {
    setGeom(geom);
  };

  const changeWidget = (newWidget: string) => {
    if (!map) {
      return;
    }

    let drawLayer = MapUtil.getLayerByName(map, 'react-geo_digitize') as OlVectorLayer<OlVectorSource>;

    setGeom(null);
    drawLayer?.getSource()?.clear();
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
        />
      case 'video':
        return <VideoComponent
          geoJsonGeom={geoJsonGeom}
          region={region}
          onDrawEnd={onDrawEnd}
        />
      case 'warning':
        return <WarningComponent
          wktGeom={wktGeom}
          geoJsonGeom={geoJsonGeom}
          region={region}
          onDrawEnd={onDrawEnd}
        />
    }
  }

  return (
    <div className='App'>
      <MapContext.Provider value={map}>
        <ConfigProvider
        >
          <div className='output-wrapper'>
            <div className='header'>
              <img className='logo' src="https://www.klips-projekt.de/wp-content/uploads/2021/02/SAG_KLIPS-Logo_Jan21.png" alt="KLIPS Logo"></img>
              <h2>Widget URL Generator</h2>
            </div>
            <p className='information-text'>
              Konfigurieren Sie sich die URL zu unseren Widgets, indem Sie das nachstehende
              Formular ausfüllen. Mit der URL können Sie die aktuellen Daten aus dem KLIPS
              Projekt einfach in Ihrer Webseite darstellen.</p><br />
            <p className='information-text-bold'><b>Und so einfach geht's:</b></p><br />
            <ol className='information-table'>
              <li>Widget auswählen</li>
              <li>URL generieren</li>
              <li>Code-Beispiel in die Webseite integrieren</li>
            </ol>
            <p className='information-text'>Dabei aktualisieren sich die Wetterdaten stündlich von selbst!</p><br />
            <SelectRegion
              inputRegions={optionsRegion}
              onChangeRegion={changeRegion}
              regionName={region}
            />
            <PhotonSearch />
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
        </ConfigProvider>
      </MapContext.Provider >
    </div >
  );
};

export default App;
