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

  const url = 'https://klips2024.terrestris.de/geoserver/ows?SERVICE=WMS&';

  const hi = new OlLayerTile({
    opacity: 0.7,
    visible: true,
    source: new OlSourceTileWMS({
      url: url,
      projection: 'CRS:84',
      params: {
        LAYERS: ['dresden:dresden_hi'],
        TILED: true
      }
    })
  });
  hi.set('name', 'Heat Index (HI)');

  const uhi = new OlLayerTile({
    opacity: 0.7,
    visible: false,
    source: new OlSourceTileWMS({
      url: url,
      projection: 'CRS:84',
      params: {
        LAYERS: ['dresden:dresden_uhi'],
        TILED: true
      }
    })
  });
  uhi.set('name', 'Urban Heat Islands (UHI)');

  const neustadtHI = new OlLayerTile({
    opacity: 0.7,
    visible: true,
    source: new OlSourceTileWMS({
      url: url,
      projection: 'CRS:84',
      params: {
        LAYERS: ['dresden:dresden_simulation_neustadt_hi'],
        TILED: true
      }
    })
  });
  neustadtHI.set('name', 'Simulated Heatindex Neustadt');

  const lenneplatzHI = new OlLayerTile({
    opacity: 0.7,
    visible: false,
    source: new OlSourceTileWMS({
      url: url,
      projection: 'CRS:84',
      params: {
        LAYERS: ['dresden:dresden_simulation_lenneplatz_hi'],
        TILED: true
      }
    })
  });
  lenneplatzHI.set('name', 'Simulated Heatindex lenneplatz');

  const neustadtUHI = new OlLayerTile({
    opacity: 0.7,
    visible: false,
    source: new OlSourceTileWMS({
      url: url,
      projection: 'CRS:84',
      params: {
        LAYERS: ['dresden:dresden_simulation_neustadt_uhi'],
        TILED: true
      }
    })
  });
  neustadtUHI.set('name', 'Simulated UHI Neustadt');

  const lenneplatzUHI = new OlLayerTile({
    opacity: 0.7,
    visible: false,
    source: new OlSourceTileWMS({
      url: url,
      projection: 'CRS:84',
      params: {
        LAYERS: ['dresden:dresden_simulation_lenneplatz_uhi'],
        TILED: true
      }
    })
  });
  lenneplatzUHI.set('name', 'Simulated UHI lenneplatz');

  const simulationLayerGroup = new OlLayerGroup({
    layers: [hi, uhi, neustadtHI, lenneplatzHI, neustadtUHI, lenneplatzUHI]
  });
  simulationLayerGroup.set('name', 'Dresden Heatindex Simulation Data');

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
    layers: [backgroundLayerGroup, simulationLayerGroup]
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
