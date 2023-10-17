import React from 'react';

import BasicMapComponent from './components/BasicMapComponent';
import BasicNominatimSearch from './components/BasicNominatimSearch';
import BasicSwipe from './components/BasicSwipe';

import OlLayerTile from 'ol/layer/Tile';
import OlSourceTileWMS from 'ol/source/TileWMS';

import { useMap } from '@terrestris/react-geo';

import './App.less';

export const App: React.FC = (): JSX.Element => {

  const map = useMap();

  if (!map) {
    return <></>;
  };

  return (
    <div className="App">
      <BasicSwipe />
      <BasicMapComponent />
      <BasicNominatimSearch />
      <BasicSwipe />
    </div>
  );
};

export default App;
