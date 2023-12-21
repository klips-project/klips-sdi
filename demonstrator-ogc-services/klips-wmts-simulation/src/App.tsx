import React, {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  Space, Switch
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
import { MapUtil } from '@terrestris/ol-util';

export const App: React.FC = (): JSX.Element => {
  const map = useMap();

  const [opacityBlock, setOpacityBlock] = useState<boolean>(false);
  const [legendBlock, setLegendBlock] = useState<boolean>(false);

  if (!map) {
    return <></>;
  };

  const {
    t
  } = useTranslation();

  const neustadt = MapUtil.getLayerByName(map, 'Simulated Heatindex Neustadt') as OlLayerTile<OlSourceTileWMS>;
  const leneeplatz = MapUtil.getLayerByName(map, 'Simulated Heatindex Leneeplatz') as OlLayerTile<OlSourceTileWMS>;
  const unmodified = MapUtil.getLayerByName(map, 'Unmodified Heatindex') as OlLayerTile<OlSourceTileWMS>;

  const layer = neustadt.getVisible() ? neustadt : leneeplatz;

  let layers;
  useEffect(() => {
    layers = [unmodified, layer];
  }, [layer, unmodified]);

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

  const labelFirstLayer: string = 'Unmodified';
  const labelSecondLayer: string = 'Simulation';

  const legendUrlFirstLayer = 'https://klips-dev.terrestris.de/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&'
    + 'FORMAT=image/png&WIDTH=20&HEIGHT=15&STRICT=false&LAYER=dresden:dresden_simulation_unmodified';

  const legendUrlSecondLayer = 'https://klips-dev.terrestris.de/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&'
    + 'FORMAT=image/png&WIDTH=20&HEIGHT=15&STRICT=false&LAYER=dresden:dresden_simulation_neustadt';

  const legend =
    <>
      <Space direction="vertical">
        <img src={legendUrlFirstLayer} />
        <span className='legend-label'>Unmodified</span>
      </Space>
      <Space direction="vertical">
        <img src={legendUrlSecondLayer} />
        <span className='legend-label'>Simulation</span>
      </Space>
    </>;


  const onChange = (checked: boolean) => {
    if (!checked) {
      leneeplatz.setVisible(false);
      neustadt.setVisible(true);
      map.render();
    } else {
      leneeplatz.setVisible(true);
      neustadt.setVisible(false);
      map.render();
    };
    console.log(checked);
  };

  return (
    <>
      <div className="App">
        <BasicMapComponent />
        <BasicSwipe
          labelRight={labelSecondLayer}
          labelLeft={labelFirstLayer}
        />
        <Switch
          onChange={onChange}
        />
        <BasicNominatimSearch />
      </div>
      <div id='slider' >
        <BasicTimeSlider
          min={1}
          max={24}
          date={'2023-01-01'}
          layers={layers ? layers as OlLayerTile < OlSourceTileWMS >[] : []}
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
            layer={unmodified}
          />
          <div>
            <span>{labelSecondLayer}</span>
          </div>
          <LayerTransparencySlider
            layer={layer}
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
