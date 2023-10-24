import React from 'react';

import OlLayerTile from 'ol/layer/Tile';
import OlSourceTileWMS from 'ol/source/TileWMS';

import BasicMapComponent from './components/BasicMapComponent';
import BasicNominatimSearch from './components/BasicNominatimSearch';
import BasicSwipe from './components/BasicSwipe';
import BasicTimeSlider from './components/BasicTimeSlider';

import { LayerTransparencySlider, SimpleButton, useMap } from '@terrestris/react-geo';

import './App.less';

export const App: React.FC = (): JSX.Element => {

  const toggleHidden = () => {
    const transparencySlider = document.getElementById('transperency-slider');
    if (!transparencySlider) {
      return;
    };
    if (transparencySlider.style.display === 'none') {
      transparencySlider.style.display = 'block';
    } else {
      transparencySlider.style.display = 'none';
    }
  };

  const map = useMap();

  if (!map) {
    return <></>;
  };

  const firstLayer = map.getAllLayers()[1] as OlLayerTile<OlSourceTileWMS>;
  const secondLayer = map.getAllLayers()[2] as OlLayerTile<OlSourceTileWMS>;

  const layers: OlLayerTile<OlSourceTileWMS>[] = [firstLayer, secondLayer];

  const labelFirstLayer: string = 'Heat Index (HI)'
  const labelSecondLayer: string = 'Urban Heat Island (UHI)'

  return (
    <>
      <div className="App">
        <BasicMapComponent />
        <BasicSwipe
          labelRight={labelSecondLayer}
          labelLeft={labelFirstLayer} />
        <BasicNominatimSearch />
      </div>
      <div id="slider">
        <BasicTimeSlider
          min={1}
          max={24}
          date={'2023-01-01'}
          layers={layers} />
        <SimpleButton
          className="toggle-button"
          onClick={toggleHidden}
        >Transparenz der Layer festlegen</SimpleButton>
        <div id="transperency-slider">
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
    </>
  );
};

export default App;
