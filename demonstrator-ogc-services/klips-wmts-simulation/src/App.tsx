import React, {
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

  if (!map) {
    return <></>;
  };

  // get Layers
  const neustadtHI = MapUtil.getLayerByName(map, 'Simulated Heatindex Neustadt') as OlLayerTile<OlSourceTileWMS>;
  const lenneplatzHI = MapUtil.getLayerByName(map, 'Simulated Heatindex lenneplatz') as OlLayerTile<OlSourceTileWMS>;
  const neustadtUHI = MapUtil.getLayerByName(map, 'Simulated UHI Neustadt') as OlLayerTile<OlSourceTileWMS>;
  const lenneplatzUHI = MapUtil.getLayerByName(map, 'Simulated UHI lenneplatz') as OlLayerTile<OlSourceTileWMS>;
  const unmodifiedHI = MapUtil.getLayerByName(map, 'Heat Index (HI)') as OlLayerTile<OlSourceTileWMS>;
  const unmodifiedUHI = MapUtil.getLayerByName(map, 'Urban Heat Islands (UHI)') as OlLayerTile<OlSourceTileWMS>;
  const layers = [neustadtHI, neustadtUHI, lenneplatzHI, lenneplatzUHI, unmodifiedHI, unmodifiedUHI];

  const [opacityBlock, setOpacityBlock] = useState<boolean>(false);
  const [legendBlock, setLegendBlock] = useState<boolean>(false);
  const [unmodified, setUnmodified] = useState<OlLayerTile<OlSourceTileWMS>>(unmodifiedHI);
  const [neustadt, setNeustadt] = useState<OlLayerTile<OlSourceTileWMS>>(neustadtHI);
  const [lenneplatz, setlenneplatz] = useState<OlLayerTile<OlSourceTileWMS>>(lenneplatzHI);
  const [simulation, setSimulation] = useState<string>('Neustadt');
  const [layer, setLayer] = useState<OlLayerTile<OlSourceTileWMS>>(neustadtHI);

  useEffect(() => {
    setLayer((simulation === 'Neustadt') ? neustadt : lenneplatz);
  }, [simulation, neustadt, lenneplatz]);

  const changeSimulation = (newSimulation: string) => {
    setSimulation(newSimulation);
  };

  const {
    t
  } = useTranslation();

  // set Index (UHI or HI) to be displayed
  // sets visibility for all layers (true for selected, false for not selected)
  const onChangeIndex = (checked: boolean) => {
    layers.forEach(l => l.setVisible(false));
    if (!checked) {
      setUnmodified(unmodifiedHI);
      setNeustadt(neustadtHI);
      setlenneplatz(lenneplatzHI);
      unmodifiedHI.setVisible(true);
      if (simulation === 'Neustadt') {
        neustadtHI.setVisible(true);
      } else {
        lenneplatzHI.setVisible(true);
      };
    } else {
      setUnmodified(unmodifiedUHI);
      setNeustadt(neustadtUHI);
      setlenneplatz(lenneplatzUHI);
      unmodifiedUHI.setVisible(true);
      if (simulation === 'Neustadt') {
        neustadtUHI.setVisible(true);
      } else {
        lenneplatzUHI.setVisible(true);
      };
    };
  };

  // Slider for controlling layer transperency
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

  // Legend Box
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
  const layerNameUnmodified = unmodified.getSource()?.getParams().LAYERS[0];
  const legendUnmodified = 'https://klips-dev.terrestris.de/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&'
    + `FORMAT=image/png&WIDTH=20&HEIGHT=15&STRICT=false&LAYER=${layerNameUnmodified}`;

  const legend =
    <>
      <Space direction="vertical">
        <img src={legendUnmodified} />
      </Space>
    </>;

  return (
    <>
      <div className="App">
        <BasicMapComponent />
        <BasicSwipe
          changeSimulation={changeSimulation}
        />
        <Switch
          onChange={onChangeIndex}
          unCheckedChildren="Hitzeindex (HI)"
          checkedChildren="Hitzeinsel Effekt (UHI)"
        />
        <BasicNominatimSearch />
      </div>
      <div
      aria-label='transperency-slider' 
      id='transperency-slider' >
        <div>
          <span>{'Original'}</span>
        </div>
        <LayerTransparencySlider
          layer={unmodified}
        />
        <div>
          <span>{'Simulation'}</span>
        </div>
        <LayerTransparencySlider
          layer={layer}
        />
      </div>
      <div
        id='slider'
        aria-label='time-slider'
      >
        <BasicTimeSlider
          min={1}
          max={24}
          date={'2023-01-01'}
          layers={[unmodified, layer]}
        />
      </div >
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
    </>
  );
};

export default App;
