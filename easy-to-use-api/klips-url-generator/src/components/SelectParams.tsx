import * as React from 'react';
import { useState } from 'react';
import OlFormatGeoJSON from 'ol/format/GeoJSON';

interface OwnProps {
  inputRegions?: [{
    name: string;
    center: number[];
    feature: OlFormatGeoJSON;
  },
    {
      name: string;
      center: number[];
      feature: OlFormatGeoJSON;
    }
  ];

  inputBands?: [
    string,
    string,
    string,
    string
  ];

  changeRegion?: (newRegion: any) => void;

  changeBand?: (newBand: any) => void;

  changeThreshold?: (newThreshold: any) => void;
};

export type SelectParamsProps = OwnProps;

const SelectParams: React.FC<SelectParamsProps> = ({ inputRegions, inputBands, changeRegion, changeBand, changeThreshold }) => {
  const [open, setOpen] = useState(false);
  const [threshold, setThreshold] = useState('25');

  const region = inputRegions;
  const band = inputBands;
  // newThreshold = { input: '' };

  if (!region || !band) {
    return null
  };

  // Menu handler 
  const handleMenuBand = (input: any) => {
    changeBand?.(input);
  }

  const handleMenuRegion = (input: any) => {
    changeRegion?.(input);
  }

  const selectThreshold = (event: any) => {
    setThreshold(event.target.value);
    changeThreshold?.(event.target.value);
  }

  const handleOpen = () => {
    setOpen(!open);
  };

  const optionsRegion = region.map((input) =>
    <li key={input.name} onClick={() => handleMenuRegion(input)}>{input.name}</li>
  );

  const optionsBand = band.map((input) =>
    <li key={input.toString()} onClick={() => handleMenuBand(input)}>{input}</li>
  );

  return (
    <div className='select-params-wrapper'>
      <div className={'dropdown'}>
        <button onClick={handleOpen} className={'button'}>Region</button>
        <div className={'dropdown-content'}><ul>{optionsRegion}</ul></div >
      </div>
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
