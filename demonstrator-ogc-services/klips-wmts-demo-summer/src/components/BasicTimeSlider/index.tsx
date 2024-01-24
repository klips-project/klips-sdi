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
import utc from 'dayjs/plugin/utc';
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
  let date = '2023-08-11T00:00:00+00:00';
  const [timestamp, setTimestamp] = useState<string>(dayjs().utc().format('DD.MM.YYYY HH:00'));

  const map = useMap();

  if (!map) {
    return <></>;
  };

  const onChange = (newValue: number) => {
    date = dayjs(date).add(newValue, 'hours').utc().format('YYYY-MM-DDTHH:00:00Z');
    const time = moment(date).toISOString();
    setTimestamp(dayjs(date).add(newValue, 'hours').utc().format('DD.MM.YYYY HH:00'));

    layers.forEach((element: any) => element.getSource().updateParams({
      TIME: time
    }));
    map.render();
  };

  const marks: SliderMarks = {
    '-48': dayjs(date).utc().subtract(48, 'hours').format('DD.MM.YYYY HH:00'),
    '-36': dayjs(date).utc().subtract(36, 'hours').format('DD.MM.YYYY HH:00'),
    '-24': dayjs(date).utc().subtract(24, 'hours').format('DD.MM.YYYY HH:00'),
    '-12': dayjs(date).utc().subtract(12, 'hours').format('DD.MM.YYYY HH:00'),
    '0': dayjs(date).utc().format('DD.MM.YYYY HH:00'),
    '12': dayjs(date).utc().add(12, 'hours').format('DD.MM.YYYY HH:00'),
    '24': dayjs(date).utc().add(24, 'hours').format('DD.MM.YYYY HH:00'),
    '36': dayjs(date).utc().add(36, 'hours').format('DD.MM.YYYY HH:00'),
    '48': dayjs(date).utc().add(48, 'hours').format('DD.MM.YYYY HH:00'),
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
