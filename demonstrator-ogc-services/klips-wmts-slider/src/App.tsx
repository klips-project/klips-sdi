import React, { useState } from 'react';

import {
  Space
} from 'antd';
import OlLayerTile from 'ol/layer/Tile';
import OlSourceTileWMS from 'ol/source/TileWMS';

import {
  useTranslation
} from 'react-i18next';

import {
  LayerTransparencySlider, SimpleButton, useMap
} from '@terrestris/react-geo';

import BasicMapComponent from './components/BasicMapComponent';
import BasicNominatimSearch from './components/BasicNominatimSearch';
import BasicSwipe from './components/BasicSwipe';
import BasicTimeSlider from './components/BasicTimeSlider';

import './App.less';

export const App: React.FC = (): JSX.Element => {
  const map = useMap();

  if (!map) {
    return <></>;
  };

  const {
    t
  } = useTranslation();

  const [opacityBlock, setOpacityBlock] = useState<boolean>(false);
  const [legendBlock, setLegendBlock] = useState<boolean>(false);

  const toggleHidden = () => {
    const transparencySlider = document.getElementById('transperency-slider');

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

  const firstLayer = map.getAllLayers()[1] as OlLayerTile<OlSourceTileWMS>;
  const secondLayer = map.getAllLayers()[2] as OlLayerTile<OlSourceTileWMS>;

  const layers: OlLayerTile<OlSourceTileWMS>[] = [firstLayer, secondLayer];

  const labelFirstLayer: string = 'Heat Index (HI)';
  const labelSecondLayer: string = 'Urban Heat Island (UHI)';

  const legendUrlFirstLayer = 'https://klips-dev.terrestris.de/geoserver/wms?REQUEST=GetLegendGraphic&VERSION'
    + '=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=10&STRICT=false&style=klips:temperature_hi';
  const legendUrlSecondLayer = 'https://klips-dev.terrestris.de/geoserver/wms?REQUEST=GetLegendGraphic&VERSION'
    + '=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=27&STRICT=false&style=klips:temperature_uhi';

  const legend =
    <>
      <Space direction="vertical">
        <img src={legendUrlFirstLayer} />
        <span className='legend-label'>HI</span>
      </Space>
      <Space direction="vertical">
        <img src={legendUrlSecondLayer} />
        <span className='legend-label'>UHI</span>
      </Space>
    </>;

  return (
    <>
      <div className="App">
        <BasicMapComponent />
        <BasicSwipe
          labelRight={labelSecondLayer}
          labelLeft={labelFirstLayer}
        />
        <BasicNominatimSearch />
      </div>
      <div id='slider' >
        <BasicTimeSlider
          min={1}
          max={24}
          date={'2023-01-01'}
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
        <div id='transperency-slider' >
          <div>
            <span>{labelFirstLayer}</span>
          </div>
          <LayerTransparencySlider
            layer={firstLayer}
          />
          <div>
            <span>{labelSecondLayer}</span>
          </div>
          <LayerTransparencySlider
            layer={secondLayer}
          />
        </div>
      </div >
      <div id='legend' >
        {legend}
      </div>
    </>
  );
};

export default App;
