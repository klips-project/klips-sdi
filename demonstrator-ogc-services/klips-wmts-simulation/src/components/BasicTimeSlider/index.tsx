import React, {
  useState
} from 'react';

import {
  ClockCircleOutlined
} from '@ant-design/icons';
import {
  Col, Row, Slider
} from 'antd';
import type {
  SliderMarks
} from 'antd/es/slider';
import moment from 'moment';

import OlLayerTile from 'ol/layer/Tile';
import OlSourceTileWMS from 'ol/source/TileWMS';

import useMap from '@terrestris/react-geo/dist/Hook/useMap';

import './index.less';

interface OwnProps {
  min: number;
  max: number;
  date: string;
  layers: OlLayerTile<OlSourceTileWMS>[];
}

export type BasicTimeSliderProps = OwnProps;

const BasicTimeSlider: React.FC<BasicTimeSliderProps> = ({
  min, max, date, layers
}) => {
  const [timestamp, setTimestamp] = useState<string>('01:00');

  const map = useMap();

  if (!map) {
    return <></>;
  };
  const onChange = (newValue: number) => {
    const dateStr = moment(date).format('YYYY-MM-DD');
    const timeStr = `${newValue}:00`;
    setTimestamp(timeStr);

    const time = moment(dateStr + ' ' + timeStr).toISOString();

    layers.forEach((element: any) => element.getSource().updateParams({
      TIME: time
    }));
    map.render();
  };

  const marks: SliderMarks = {
    1: '01:00',
    12: '12:00',
    24: '24:00'
  };

  return (
    <Row gutter={30}
      className='slider-row'
    >
      <Col span={20}>
        <Slider
          className='custom-time-slider'
          tooltip={{
            open: false
          }}
          onChange={onChange}
          min={min}
          max={max}
          marks={marks}
        />
      </Col>
      <Col offset={1}>
        <ClockCircleOutlined />
      </Col>
      <Col span={1}>{timestamp}</Col>
    </Row>
  );
};

export default BasicTimeSlider;
