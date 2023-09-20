import * as React from 'react';
import { Input } from 'antd';
import { useState } from 'react';

export interface paramProps {
    changeThreshold?: (newThreshold: any) => void;
};

export type SelectParamsProps = paramProps;

const SelectThreshold: React.FC<SelectParamsProps> = ({ changeThreshold }) => {
    const [threshold, setThreshold] = useState();

    const selectThreshold = (event: any) => {
        setThreshold(event.target.value);
        changeThreshold?.(event.target.value);
    }

    return (
        <div className='threshold-selector'>
            {threshold ? <></> :
                <div>Bitte wählen Sie einen Temperatur-Grenzwert für die Anzeige im Diagramm aus</div>
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
