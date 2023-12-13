import * as React from 'react';
import { Select } from 'antd';

export interface paramProps {
  changeInfo?: (newBand: any) => void;
  selectedInfo: string;
};

export type SelectParamsProps = paramProps;

const SelectInfo: React.FC<SelectParamsProps> = ({ changeInfo, selectedInfo }) => {
  
  const infoOptions = React.useMemo(() => {
    return ([
      {
        value: 'traffic-light',
        label: 'Ampel-Anzeige'
      },
      {
        value: 'info-board',
        label: 'Info-Tafel'
      },
    ])
  }, [])

  return (
    <div className='info-selector'>
      <h3>Informationanzeige:</h3>
      <Select
        options={infoOptions}
        onChange={changeInfo}
        defaultValue={selectedInfo}
      />
    </div >
  );
};

export default SelectInfo;
