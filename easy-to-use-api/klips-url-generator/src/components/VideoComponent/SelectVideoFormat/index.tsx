import * as React from 'react';
import { Select } from 'antd';

export interface videoProps {
    inputVideoFormats?: String[];
    changeVideoFormat?: (newBand: any) => void;
    selectedVideoFormat: String;
};

export type SelectVideoProps = videoProps;

const SelectVideoFormat: React.FC<SelectVideoProps> = ({ inputVideoFormats, changeVideoFormat, selectedVideoFormat }) => {

    const videoFormatOptions = React.useMemo(() => {
        return inputVideoFormats?.map((videoFormat) => {
            return {
                'value': videoFormat,
                'label': videoFormat
            };
        })
    }, [inputVideoFormats])

    return (
        <div className='band-selector'>
            <h3>Video Format:</h3>
            <Select
                status={selectedVideoFormat ? '' : 'warning'}
                placeholder="Video Format"
                options={videoFormatOptions}
                onChange={changeVideoFormat}
                defaultValue={selectedVideoFormat}
            />
        </div >
    );
};

export default SelectVideoFormat;
