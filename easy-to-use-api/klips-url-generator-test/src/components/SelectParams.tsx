import * as React from 'react';
import { useState, createElement } from 'react';
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

  changeParams?: (newParam: any) => void;

  changeBand?: (newBand: any) => void;
};

export type SelectParamsProps = OwnProps;

const SelectParams: React.FC<SelectParamsProps> = ({ inputRegions, inputBands, changeParams, changeBand }) => {
  const [open, setOpen] = useState(false);

  const region = inputRegions;
  const band = inputBands;

  if (!region) {
    return null
  };

  if (!band) {
    return null
  };

  // Menu handlers for region 
  const handleMenuOne = () => {
    console.log(region[0].name);
    changeParams?.(region[0]);
  };

  const handleMenuTwo = () => {
    console.log(region[1].name);
    changeParams?.(region[1]);
  };

  // // Menu handler for band
  // const handleMenu = () => {

  //   console.log(band[i]);
  //   changeBand?.(band[i]);
  // };

  const handleOpen = () => {
    setOpen(!open);
  };

  const optionsRegion = (<div className={'dropdown-content'}>
    <p onClick={handleMenuOne}>{region[0].name}</p>
    <p onClick={handleMenuTwo}>{region[1].name}</p>
  </div>
  );

  const optionsBand = band.map((number) =>
    <li key={number.toString()} onClick={band.toggle.bind(this, number)}>{number}</li>
  );

  return (
    <div>
      <div className={'dropdown'}>
        <button onClick={handleOpen} className={'dropbtn'}>Region</button>
        {optionsRegion}
      </div>
      <div className={'dropdown'}>
        <button onClick={handleOpen} className={'dropbtn'}>Band</button>
        <div className={'dropdown-content'}><ul>{optionsBand}</ul></div >
      </div>
    </div>
  );
};

export default SelectParams;