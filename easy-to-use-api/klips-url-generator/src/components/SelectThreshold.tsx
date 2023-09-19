import * as React from 'react';
import { Input } from 'antd';

export interface paramProps {
    changeThreshold?: (newThreshold: any) => void;
};

export type SelectParamsProps = paramProps;

const SelectThreshold: React.FC<SelectParamsProps> = ({ changeThreshold }) => {
    const [threshold, setThreshold] = React.useState();

    const selectThreshold = (event: any) => {
        setThreshold(event.target.value);
        changeThreshold?.(event.target.value);
    }

    return (
            <Input
                placeholder="Grenzwert"
                value={threshold}
                onChange={selectThreshold}
            />
    );
};

export default SelectThreshold;
