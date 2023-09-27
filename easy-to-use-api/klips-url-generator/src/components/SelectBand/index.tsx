import * as React from 'react';
import { Bands } from '../../types';
import { Select } from 'antd';

export interface paramProps {
  inputBands?: Bands;
  changeBand?: (newBand: any) => void;
  selectedBand: String;
};

export type SelectParamsProps = paramProps;

const SelectParams: React.FC<SelectParamsProps> = ({ inputBands, changeBand, selectedBand }) => {
  // const [selected, setSelected] = useState<Boolean>(false);

  const bandOptions = React.useMemo(() => {
    return inputBands?.map((band) => {
      return {
        'value': band,
        'label': band
      };
    })
  }, [inputBands])

  return (
    <div className='band-selector'>
      {selectedBand ? <></> :
        <div className='no-selection-text'>Bitte wählen Sie ein Band für die Anzeige im Diagramm aus</div>
      }
      <Select
        style={{ width: '100%' }}
        showSearch
        placeholder="Aktives Band"
        options={bandOptions}
        onChange={changeBand}
      />
    </div >
  );
};

export default SelectParams;
