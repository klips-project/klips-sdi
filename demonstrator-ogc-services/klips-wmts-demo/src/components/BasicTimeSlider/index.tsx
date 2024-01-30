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

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);

import moment from 'moment';

import OlLayer from 'ol/layer/Layer';

import useMap from '@terrestris/react-geo/dist/Hook/useMap';

import './index.less';

interface OwnProps {
  min: number;
  max: number;
  layers: OlLayer[];
}

export type BasicTimeSliderProps = OwnProps;

const BasicTimeSlider: React.FC<BasicTimeSliderProps> = ({
  min, max, layers
}) => {
  const [timestamp, setTimestamp] = useState<string>(dayjs().utc().format('DD.MM.YYYY HH:00'));

  const map = useMap();

  if (!map) {
    return <></>;
  };

  const onChange = (newValue: number) => {
    const date = dayjs().add(newValue, 'hours').utc().format('YYYY-MM-DDTHH:00:00Z');
    const time = moment(date).toISOString();
    setTimestamp(dayjs().add(newValue, 'hours').format('DD.MM.YYYY HH:00'));

    layers.forEach((element: any) => element.getSource().updateParams({
      TIME: time
    }));
    map.render();
  };

  const marks: SliderMarks = {
    '-48': dayjs().subtract(48, 'hours').format('DD.MM.YYYY HH:00'),
    '-36': dayjs().subtract(36, 'hours').format('DD.MM.YYYY HH:00'),
    '-24': dayjs().subtract(24, 'hours').format('DD.MM.YYYY HH:00'),
    '-12': dayjs().subtract(12, 'hours').format('DD.MM.YYYY HH:00'),
    '0': dayjs().format('DD.MM.YYYY HH:00'),
    '12': dayjs().add(12, 'hours').format('DD.MM.YYYY HH:00'),
    '24': dayjs().add(24, 'hours').format('DD.MM.YYYY HH:00'),
    '36': dayjs().add(36, 'hours').format('DD.MM.YYYY HH:00'),
    '47': dayjs().add(47, 'hours').format('DD.MM.YYYY HH:00'),
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
          defaultValue={0}
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
