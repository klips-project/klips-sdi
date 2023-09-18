import * as React from 'react';
import { useState } from 'react';
import { Bands } from '../types';

export interface paramProps {
  inputBands?: Bands;

  changeRegion?: (newRegion: any) => void;

  changeBand?: (newBand: any) => void;

  changeThreshold?: (newThreshold: any) => void;
};

export type SelectParamsProps = paramProps;

const SelectParams: React.FC<SelectParamsProps> = ({ inputBands, changeBand, changeThreshold }) => {
  const [open, setOpen] = useState(false);
  const [threshold, setThreshold] = useState('25');

  const band = inputBands;
  // newThreshold = { input: '' };

  if (!band) {
    return null
  };

  // Menu handler 
  const handleMenuBand = (input: any) => {
    changeBand?.(input);
  }

  const selectThreshold = (event: any) => {
    setThreshold(event.target.value);
    changeThreshold?.(event.target.value);
  }

  const handleOpen = () => {
    setOpen(!open);
  };

  const optionsBand = band.map((input) =>
    <li key={input.toString()} onClick={() => handleMenuBand(input)}>{input}</li>
  );

  return (
    <div className='select-params-wrapper'>
      <div className={'dropdown'}>
        <button onClick={handleOpen} className={'button'}>Aktives Band</button>
        <div className={'dropdown-content'}><ul>{optionsBand}</ul></div >
      </div>
      <div className={'number'}>
        <button onClick={handleOpen} className={'button'}>Grenzwert (°C)</button>
        <div><input type="text"
          onChange={selectThreshold}
          value={threshold}
          className={'number-content'}
        /></div>
      </div>
    </div >
  );
};

export default SelectParams;
