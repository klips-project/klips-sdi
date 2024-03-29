import React, {
  useState
} from 'react';

import {
  Button, Slider, Space
} from 'antd';
import {
  getRenderPixel
} from 'ol/render';
import RenderEvent from 'ol/render/Event';

import useMap from '@terrestris/react-geo/dist/Hook/useMap';
import './index.less';
interface OwnProps {
  labelRight: string;
  labelLeft: string;
}

export type BasicSwipeProps = OwnProps;

const BasicSwipe: React.FC<BasicSwipeProps> = ({
  labelRight, labelLeft
}) => {
  const [value, setValue] = useState<number>(50);
  const [labelPosition, setLabelPosition] = useState<number>(0);

  const map = useMap();

  if (!map) {
    return <></>;
  };

  const layerRight = map.getAllLayers()[2];
  const layerLeft = map.getAllLayers()[1];

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

  const top = 12 + 'vh';
  const padding = 11 + 'px';
  const left = labelPosition - 15 + 'px';
  const right = labelPosition - 130 + 'px';

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
          {labelRight}
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
          {labelLeft}
        </Button>
      </Space>
    </>
  );
};

export default BasicSwipe;
