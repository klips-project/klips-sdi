import React, {
  useEffect,
  useState
} from 'react';

import {
  Button, Slider, Space, Switch
} from 'antd';
import OlLayerTile from 'ol/layer/Tile';
import {
  getRenderPixel
} from 'ol/render';
import RenderEvent from 'ol/render/Event';

import OlSourceTileWMS from 'ol/source/TileWMS';

import useMap from '@terrestris/react-geo/dist/Hook/useMap';
import './index.less';
import {
  MapUtil
} from '@terrestris/ol-util';
import { fromLonLat } from 'ol/proj';
interface OwnProps {
  changeSimulation: (newSimulation: any) => void;
}

export type BasicSwipeProps = OwnProps;

const BasicSwipe: React.FC<BasicSwipeProps> = ({
  changeSimulation
}) => {
  // define Map center
  const centerNeustadt = fromLonLat([
    13.755154,
    51.071628
  ], 'EPSG:3857');

  const centerLeneeplatz = fromLonLat([
    13.746989,
    51.038214
  ], 'EPSG:3857');

  const [value, setValue] = useState<number>(50);
  const [labelPosition, setLabelPosition] = useState<number>(0);
  const map = useMap();

  if (!map) {
    return <></>;
  };

  // get Layers
  const neustadtHI = MapUtil.getLayerByName(map, 'Simulated Heatindex Neustadt') as OlLayerTile<OlSourceTileWMS>;
  const leneeplatzHI = MapUtil.getLayerByName(map, 'Simulated Heatindex Leneeplatz') as OlLayerTile<OlSourceTileWMS>;
  const neustadtUHI = MapUtil.getLayerByName(map, 'Simulated UHI Neustadt') as OlLayerTile<OlSourceTileWMS>;
  const leneeplatzUHI = MapUtil.getLayerByName(map, 'Simulated UHI Leneeplatz') as OlLayerTile<OlSourceTileWMS>;
  const unmodifiedHI = MapUtil.getLayerByName(map, 'Heat Index (HI)') as OlLayerTile<OlSourceTileWMS>;
  const unmodifiedUHI = MapUtil.getLayerByName(map, 'Urban Heat Islands (UHI)') as OlLayerTile<OlSourceTileWMS>;

  // set layer visibility based on switch selection
  let simulation: string;
  const onChangeSimulation = (checked: boolean) => {
    if (!checked) {
      if (!unmodifiedUHI.getVisible()) {
        neustadtHI.setVisible(true);
        leneeplatzHI.setVisible(false);
        neustadtUHI.setVisible(false);
      } else {
        neustadtUHI.setVisible(true);
        leneeplatzUHI.setVisible(false);
        neustadtHI.setVisible(false);
      };
      simulation = 'Neustadt';
      map.getView().setCenter(centerNeustadt);
      map.getView().setZoom(15);
    } else {
      if (!unmodifiedUHI.getVisible()) {
        neustadtHI.setVisible(false);
        leneeplatzHI.setVisible(true);
        leneeplatzUHI.setVisible(false);
      } else {
        neustadtUHI.setVisible(false);
        leneeplatzUHI.setVisible(true);
        leneeplatzHI.setVisible(false);
      };
      simulation = 'Leneeplatz';
      map.getView().setCenter(centerLeneeplatz);
      map.getView().setZoom(16);
    };
    changeSimulation(simulation);
    map.render();
  };

  const layerHI = neustadtHI.getVisible() ? neustadtHI : leneeplatzHI;
  const layerUHI = neustadtUHI.getVisible() ? neustadtUHI : leneeplatzUHI;
  const layerRight = layerHI.getVisible() ? layerHI : layerUHI;
  const layerLeft = unmodifiedHI.getVisible() ? unmodifiedHI : unmodifiedUHI;

  layerRight.on('prerender', function (event: RenderEvent) {
    const mapSize = map.getSize(); // [width, height] in CSS pixels

    if (!mapSize) {
      return <></>;
    };

    // get render coordinates and dimensions given CSS coordinates
    const width = Math.round(mapSize[0] * (value / 100));
    setLabelPosition(width);

    const bottomLeft = getRenderPixel(event, [width, mapSize[1]]);
    const topLeft = getRenderPixel(event, [width, 0]);
    const topRight = getRenderPixel(event, [mapSize[0], 0]);
    const bottomRight = getRenderPixel(event, mapSize);

    const context = event.context as CanvasRenderingContext2D;

    if (!context) {
      return <></>;
    };

    context.restore();

    context.save();
    context.beginPath();
    context.moveTo(topRight[0], topRight[1]);
    context.lineTo(bottomRight[0], bottomRight[1]);
    context.lineTo(bottomLeft[0], bottomLeft[1]);
    context.lineTo(topLeft[0], topLeft[1]);
    context.closePath();
    context.clip();
  });

  layerLeft.on('prerender', function (event: RenderEvent) {
    const mapSize = map.getSize(); // [width, height] in CSS pixels

    if (!mapSize) {
      return <></>;
    };

    // get render coordinates and dimensions given CSS coordinates
    const width = Math.round(mapSize[0] * (value / 100));

    const bottomLeft = getRenderPixel(event, [0, mapSize[1]]);
    const topLeft = getRenderPixel(event, [0, 0]);
    const topRight = getRenderPixel(event, [width, 0]);
    const bottomRight = getRenderPixel(event, [width, mapSize[1]]);

    const context = event.context as CanvasRenderingContext2D;

    if (!context) {
      return <></>;
    };

    context.restore();

    context.save();
    context.beginPath();
    context.moveTo(topRight[0], topRight[1]);
    context.lineTo(bottomRight[0], bottomRight[1]);
    context.lineTo(bottomLeft[0], bottomLeft[1]);
    context.lineTo(topLeft[0], topLeft[1]);
    context.closePath();
    context.clip();
  });

  layerRight.on('postrender', function (event) {
    var context = event.context as CanvasRenderingContext2D;

    if (!context) {
      return <></>;
    };

    context.restore();
  });

  layerLeft.on('postrender', function (event) {
    var context = event.context as CanvasRenderingContext2D;

    if (!context) {
      return <></>;
    };

    context.restore();
  });

  const onChange = (newValue: number) => {
    setValue(newValue);
    map.render();
  };

  const toggleRight = () => {
    setValue(10);
    map.render();
  };

  const toggleLeft = () => {
    setValue(90);
    map.render();
  };

  const top = 10 + 'vh';
  const padding = 11 + 'px';
  const left = labelPosition - 10 + 'px';
  const right = labelPosition - 90 + 'px';

  return (
    <>
      <Slider
        className='custom-slider'
        tooltip={{
          open: false
        }}
        onChange={onChange}
        value={value}
      />
      <Switch
        onChange={onChangeSimulation}
        unCheckedChildren="Neustadt"
        checkedChildren="Lenneplatz"
      />
      <Space id='label'
        style={{
          position: 'absolute',
          padding,
          left: left,
          top
        }}
      >
        <Button
          type="primary"
          onClick={toggleRight}
        >
          {'Simulation'}
        </Button>
      </Space>
      <Space id='label'
        style={{
          position: 'absolute',
          padding,
          left: right,
          top
        }}
      >
        <Button
          type="primary"
          onClick={toggleLeft}
        >
          {'Original'}
        </Button>
      </Space>
    </>
  );
};

export default BasicSwipe;
