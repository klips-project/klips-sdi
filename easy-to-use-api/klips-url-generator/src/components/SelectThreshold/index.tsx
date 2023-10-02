import * as React from 'react';
import { Input } from 'antd';
import { useState } from 'react';

export interface paramProps {
    changeThreshold?: (newThreshold: any) => void;
    warning: string;
};

export type SelectParamsProps = paramProps;

const SelectThreshold: React.FC<SelectParamsProps> = ({ 
    changeThreshold,
    warning
}) => {
    const [threshold, setThreshold] = useState();

    const selectThreshold = (event: any) => {
        setThreshold(event.target.value);
        changeThreshold?.(event.target.value);
    }

    return (
        <div className='threshold-selector'>
            {threshold ? <h3>Grenzwert {warning} Warnung:</h3> :
                <div className='no-input'>Bitte wählen Sie einen Temperatur-Grenzwert für die {warning} Warnung im Diagramm aus:</div>
            }
            <Input
                placeholder="Grenzwert"
                value={threshold}
                onChange={selectThreshold}
            />
        </div>
    );
};

export default SelectThreshold;
