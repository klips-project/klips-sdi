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
  const physical = map.getAllLayers()[1] as OlLayer;
  const perceived = map.getAllLayers()[2] as OlLayer;
  const difference = map.getAllLayers()[3] as OlLayer;

  const [layer, setLayer] = useState<string>(physical.get('name'));
  const [opacityBlock, setOpacityBlock] = useState<boolean>(false);
  const [legendBlock, setLegendBlock] = useState<boolean>(false);

  const layers = [physical, perceived, difference];
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
  const layerName = src.getParams().LAYERS[0];
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
      </div>
      <div id='slider' >
        <BasicTimeSlider
          min={-48}
          max={48}
          layers={layers}
        />
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
        <div id='transparency-slider' >
          <LayerTransparencySlider
            layer={selectedLayer}
          />
        </div >
        <div id='legend' >
          {legend}
        </div>
      </div >
    </>
  );
};

export default App;
