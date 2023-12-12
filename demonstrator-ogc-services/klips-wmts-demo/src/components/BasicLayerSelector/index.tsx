import React, {
  useEffect
} from 'react';

import { Select } from 'antd';

import OlLayer from 'ol/layer/Layer';

import { MapUtil } from '@terrestris/ol-util';
import { useMap } from '@terrestris/react-geo';

import './index.less';

export type BasicLayerSelectorProps = {
  /**
  * Array of layer options.
  */
  inputLayers: OlLayer[];
  /**
   * Visible Layer.
   */
  layer: string;
  /**
   * Function for changing the visible Layer.
   */
  onChangeLayer?: (newLayer: string) => void;
};

export const BasicLayerSelector: React.FC<BasicLayerSelectorProps> = ({
  inputLayers,
  layer,
  onChangeLayer
}) => {
  const map = useMap();
  if (!map) {
    return <></>;
  };

  useEffect(() => {
    // set layer visibility for not selected layers
    inputLayers.forEach(obj => obj.setVisible(false));
    // set layer visibility for selected layer
    const selectedLayer = MapUtil.getLayerByName(map, layer);
    selectedLayer.setVisible(true);
  }, [inputLayers, layer, map]);

  const selectOptions = React.useMemo(() => {
    return inputLayers.map((l) => {
      return {
        value: l.get('name'),
        label: l.get('name')
      };
    });
  }, [inputLayers]);

  return (
    <div className={'bg-layer-chooser'}>
      <Select
        status={layer ? undefined : 'warning'}
        placeholder="Sichtbarer Layer"
        options={selectOptions}
        onChange={onChangeLayer}
        defaultValue={layer}
      />
    </div>
  );
};

export default BasicLayerSelector;
