import React, { useState } from 'react';

import { Space } from 'antd';

import OlLayer from 'ol/layer/Layer';

import TileWMS from 'ol/source/TileWMS';

import { useTranslation } from 'react-i18next';

import { MapUtil } from '@terrestris/ol-util';

import { LayerTransparencySlider, SimpleButton, useMap } from '@terrestris/react-geo';

import BasicLayerSelector from './components/BasicLayerSelector';
import BasicMapComponent from './components/BasicMapComponent';
import BasicNominatimSearch from './components/BasicNominatimSearch';

import './App.less';
import BasicTimeSlider from './components/BasicTimeSlider';

export const App: React.FC = (): JSX.Element => {
  const map = useMap();

  if (!map) {
    return <></>;
  }

  const {
    t
  } = useTranslation();

  // get layers
  const layers = map.getAllLayers().filter(layer => layer.get('name') !== 'OpenStreetMap');
  const defaultLayer = layers.find(layer => layer.get('name') === 'Physical temperature');

  const [layer, setLayer] = useState<string>(defaultLayer?.get('name'));
  const [opacityBlock, setOpacityBlock] = useState<boolean>(false);
  const [legendBlock, setLegendBlock] = useState<boolean>(false);

  const selectedLayer = MapUtil.getLayerByName(map, layer) as OlLayer;
  const src = selectedLayer.getSource() as TileWMS;

  // create funcion to change visible layer
  const changeLayer = (newLayer: string) => {
    setLayer(newLayer);
  };

  // toggle menu
  const toggleHidden = () => {
    const transparencySlider = document.getElementById('transparency-slider');

    if (!transparencySlider) {
      return;
    };

    if (opacityBlock) {
      transparencySlider.style.display = 'none';
      setOpacityBlock(false);
    } else {
      transparencySlider.style.display = 'block';
      setOpacityBlock(true);
    }
  };

  const toggleLegend = () => {
    const transparencySlider = document.getElementById('legend');
    if (!transparencySlider) {
      return;
    };

    if (legendBlock) {
      transparencySlider.style.display = 'none';
      setLegendBlock(false);
    } else {
      transparencySlider.style.display = 'block';
      setLegendBlock(true);
    }
  };

  // get legend
  const layerName = src.getParams().LAYERS[1];
  const legendUrl = 'https://klips-dev.terrestris.de/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&'
    + `FORMAT=image/png&WIDTH=20&HEIGHT=15&STRICT=false&LAYER=${layerName}`;

  const legend =
    <>
      <Space direction="vertical">
        <img src={legendUrl} />
      </Space>
    </>;

  return (
    <>
      <div className="App">
        <BasicMapComponent />
        <div className="Menue">
          <BasicNominatimSearch />
          <BasicLayerSelector
            inputLayers={layers}
            layer={layer}
            onChangeLayer={changeLayer}
          />
        </div>
        <div id='transparency-slider' >
          <LayerTransparencySlider
            layer={selectedLayer}
          />
        </div>
      </div>
      <div id='slider' >
        <BasicTimeSlider
          min={-48}
          max={47}
          layers={layers}
        />
        <div id='buttons' >
          <SimpleButton
            className="toggle-button"
            onClick={toggleHidden}
          >
            {t('Button.opacity')}
          </SimpleButton>
          <SimpleButton
            className="toggle-button"
            onClick={toggleLegend}
          >
            {t('Button.legend')}
          </SimpleButton>
        </div>
        <div id='legend' >
          {legend}
        </div>
      </div >
    </>
  );
};

export default App;
