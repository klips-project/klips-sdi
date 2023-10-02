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

  const bandOptions = React.useMemo(() => {
    return inputBands?.map((band) => {

      // todo: improve i18n implementation
      const getBandName = (band: string) => {
        if (band === 'physical') {
          return 'Physikalische Temperatur'
        } else if (band === 'perceived') {
          return 'Gefühlte Temperatur'
        } else if (band === 'difference') {
          return 'Temperatur Differenz'
        } else if (band === 'compare') {
          return 'Vergleich'
        }
      };

      return {
        'value': band,
        'label': getBandName(band)
      };
    })
  }, [inputBands])

  return (
    <div className='band-selector'>
      {selectedBand ? <h3>Band:</h3> :
        <div className='no-input'>Bitte wählen Sie ein Band für die Anzeige im Diagramm aus:</div>
      }
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
