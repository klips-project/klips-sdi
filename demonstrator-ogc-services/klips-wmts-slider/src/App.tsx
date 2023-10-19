import React from 'react';

import OlLayerTile from 'ol/layer/Tile';
import OlSourceTileWMS from 'ol/source/TileWMS';

import BasicMapComponent from './components/BasicMapComponent';
import BasicNominatimSearch from './components/BasicNominatimSearch';
import BasicSwipe from './components/BasicSwipe';
import BasicTimeSlider from './components/BasicTimeSlider';

import { useMap } from '@terrestris/react-geo';

import './App.less';

export const App: React.FC = (): JSX.Element => {

  const map = useMap();

  if (!map) {
    return <></>;
  };

  const firstLayer = map.getAllLayers()[1] as OlLayerTile<OlSourceTileWMS>;
  const secondLayer = map.getAllLayers()[2] as OlLayerTile<OlSourceTileWMS>;

  const layers: OlLayerTile<OlSourceTileWMS>[] = [firstLayer, secondLayer];

  return (
    <div className="App">
      <BasicMapComponent />
      <BasicSwipe />
      <BasicNominatimSearch />
      <BasicTimeSlider
        min={1}
        max={24}
        date={'2023-01-01'}
        layers={layers} />
    </div>
  );
};

export default App;
