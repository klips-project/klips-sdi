import * as React from 'react';
import { Bands } from '../types';
import { Select } from 'antd';

export interface paramProps {
  inputBands?: Bands;

  changeBand?: (newBand: any) => void;
};

export type SelectParamsProps = paramProps;

const SelectParams: React.FC<SelectParamsProps> = ({ inputBands, changeBand }) => {

  const bandOptions = React.useMemo(() => {
    return inputBands?.map((band) => {
      return {
        'value': band,
        'label': band
      };
    })
  }, [inputBands])

  return (
    <div className='select-params-wrapper'>
      <Select
        showSearch
        placeholder="Aktives Band"
        options={bandOptions}
        onChange={changeBand}
      />
    </div >
  );
};

export default SelectParams;
