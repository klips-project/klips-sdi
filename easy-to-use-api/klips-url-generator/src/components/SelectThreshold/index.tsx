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
    const [threshold, setThreshold] = useState<number | undefined>();

    const selectThreshold = (event: any) => {
        setThreshold(event.target.value);
        changeThreshold?.(event.target.value);
    }

    const checkInput = (threshold: number | undefined) => {
        if (!threshold) {
            return;
        }

        if (threshold < 0) {
            return;
        } else if (threshold > 50) {
            return;
        } else return threshold;
    }

    return (
        <div className='threshold-selector'>
            {threshold ? '' :
                <div className='no-input'>Bitte wählen Sie einen gültigen Temperatur-Grenzwert 
                für die {warning} Warnung im Diagramm aus:</div>
            }
            <Input
                placeholder="0-50°C"
                // value={threshold}
                value={checkInput(threshold)}
                onChange={selectThreshold}
                type='number'
                addonAfter={<>°C</>}
            />
        </div>
    );
};

export default SelectThreshold;
