import * as React from 'react';
import { Input } from 'antd';
import { useState } from 'react';

export interface paramProps {
    changeThreshold?: (newThreshold: any) => void;
};

export type SelectParamsProps = paramProps;

const SelectThreshold: React.FC<SelectParamsProps> = ({
    changeThreshold
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
            <Input
                status={checkInput(threshold) ? '' : 'warning'}
                placeholder="0-50°C"
                value={checkInput(threshold)}
                onChange={selectThreshold}
                type='number'
                addonAfter={<>°C</>}
            />
        </div>
    );
};

export default SelectThreshold;
