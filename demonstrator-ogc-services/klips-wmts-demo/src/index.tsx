import React from 'react';

import {
  Alert,
  notification
} from 'antd';

import ConfigProvider from 'antd/lib/config-provider';
import deDE from 'antd/lib/locale/de_DE';
import enGB from 'antd/lib/locale/en_GB';

import {
  defaults as OlControlDefaults
} from 'ol/control';
import OlLayerGroup from 'ol/layer/Group';
import OlLayerTile from 'ol/layer/Tile';
import OlMap from 'ol/Map';
import {
  fromLonLat
} from 'ol/proj';
import OlSourceOsm from 'ol/source/OSM';
import OlSourceTileWMS from 'ol/source/TileWMS';
import OlView from 'ol/View';
import {
  render
} from 'react-dom';
import {
  Provider
} from 'react-redux';

import Logger from '@terrestris/base-util/dist/Logger';
import UrlUtil from '@terrestris/base-util/dist/UrlUtil/UrlUtil';

import MapContext from '@terrestris/react-geo/dist/Context/MapContext/MapContext';

import SHOGunApplicationUtil from '@terrestris/shogun-util/dist/parser/SHOGunApplicationUtil';

import SHOGunAPIClient from '@terrestris/shogun-util/dist/service/SHOGunAPIClient';

import App from './App';
import i18n from './i18n';
import {
  store
} from './store/store';

import './index.less';

const getConfigLang = (lang: string) => {
  switch (lang) {
    case 'en':
      return enGB;
    case 'de':
      return deDE;
    default:
      return enGB;
  }
};

const setupMap = async () => {
  const applicationId = UrlUtil.getQueryParam(window.location.href, 'applicationId');

  if (applicationId) {
    Logger.info(`Loading application with ID ${applicationId}`);

    return await setupSHOGunMap(parseInt(applicationId, 10));
  }

  Logger.info('No application ID given, will load the default map configuration.');

  return setupDefaultMap();
};

const setupSHOGunMap = async (applicationId: number) => {
  const client = new SHOGunAPIClient({
    url: '/api/'
  });
  const parser = new SHOGunApplicationUtil({
    client
  });

  let application;
  try {
    application = await client.application().findOne(applicationId);
  } catch (error) {
    Logger.error(`Error while loading application with ID ${applicationId}: ${error}`);
    Logger.info('Loading the default map configuration.');

    notification.error({
      message: i18n.t('Index.applicationLoadErrorMessage'),
      description: i18n.t('Index.applicationLoadErrorDescription', {
        applicationId: applicationId
      }),
      duration: 0
    });

    return setupDefaultMap();
  }

  const view = await parser.parseMapView(application);
  const layers = await parser.parseLayerTree(application);

  return new OlMap({
    view,
    layers,
    controls: OlControlDefaults({
      zoom: false
    })
  });
};

const setupDefaultMap = () => {
  const osmLayer = new OlLayerTile({
    source: new OlSourceOsm()
  });
  osmLayer.set('name', 'OpenStreetMap');

  const url = 'https://klips-dev.terrestris.de/geoserver/ows?SERVICE=WMS&';

  const physical = new OlLayerTile({
    opacity: 0.7,
    visible: false,
    source: new OlSourceTileWMS({
      url: url,
      projection: 'CRS:84',
      params: {
        LAYERS: ['langenfeld:langenfeld_temperature_physical', 'dresden:dresden_temperature_physical'],
        TILED: true
      }
    })
  });
  physical.set('name', 'Physical temperature');

  const perceived = new OlLayerTile({
    opacity: 0.7,
    visible: false,
    source: new OlSourceTileWMS({
      url: url,
      projection: 'CRS:84',
      params: {
        LAYERS: ['langenfeld:langenfeld_temperature_perceived', 'dresden:dresden_temperature_perceived'],
        TILED: true
      }
    })
  });
  perceived.set('name', 'Perceived temperature');

  const difference = new OlLayerTile({
    opacity: 0.7,
    visible: false,
    source: new OlSourceTileWMS({
      url: url,
      projection: 'CRS:84',
      params: {
        LAYERS: ['langenfeld:langenfeld_temperature_difference', 'dresden:dresden_temperature_difference'],
        TILED: true
      }
    })
  });
  difference.set('name', 'Temperature difference compared to surrounding areas');

  const physicalSummer = new OlLayerTile({
    opacity: 0.7,
    visible: false,
    source: new OlSourceTileWMS({
      url: url,
      projection: 'CRS:84',
      params: {
        LAYERS: ['dresden:dresden_summer_physical'],
        TILED: true
      }
    })
  });
  physicalSummer.set('name', 'Physical temperature summer');

  const perceivedSummer = new OlLayerTile({
    opacity: 0.7,
    visible: false,
    source: new OlSourceTileWMS({
      url: url,
      projection: 'CRS:84',
      params: {
        LAYERS: ['dresden:dresden_summer_perceived'],
        TILED: true
      }
    })
  });
  perceivedSummer.set('name', 'Perceived temperature summer');

  const differenceSummer = new OlLayerTile({
    opacity: 0.7,
    visible: false,
    source: new OlSourceTileWMS({
      url: url,
      projection: 'CRS:84',
      params: {
        LAYERS: ['dresden:dresden_summer_difference'],
        TILED: true
      }
    })
  });
  differenceSummer.set('name', 'Temperature difference compared to surrounding areas summer');

  const temperatureLayerGroup = new OlLayerGroup({
    layers: [physical, perceived, difference, physicalSummer, perceivedSummer, differenceSummer]
  });
  temperatureLayerGroup.set('name', 'KLIPS Temperature Data');

  const backgroundLayerGroup = new OlLayerGroup({
    layers: [osmLayer]
  });
  backgroundLayerGroup.set('name', 'Background');

  const center = fromLonLat([
    13.800524701521447,
    51.05873868269184
  ], 'EPSG:3857');

  return new OlMap({
    view: new OlView({
      center: center,
      zoom: 13
    }),
    layers: [backgroundLayerGroup, temperatureLayerGroup]
  });
};

const renderApp = async () => {
  try {
    const map = await setupMap();

    render(
      <React.StrictMode>
        <React.Suspense fallback={<span></span>}>
          <ConfigProvider locale={getConfigLang(i18n.language)}>
            <Provider store={store}>
              <MapContext.Provider value={map}>
                <App />
              </MapContext.Provider>
            </Provider>
          </ConfigProvider>
        </React.Suspense>
      </React.StrictMode>,
      document.getElementById('app')
    );
  } catch (error) {
    Logger.error(error);

    render(
      <React.StrictMode>
        <Alert
          className="error-boundary"
          message={i18n.t('Index.errorMessage')}
          description={i18n.t('Index.errorDescription')}
          type="error"
          showIcon
        />
      </React.StrictMode>,
      document.getElementById('app')
    );
  }
};

renderApp();
