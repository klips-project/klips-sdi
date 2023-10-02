import * as React from 'react';
import { Select } from 'antd';

export interface videoProps {
    inputVideoFormats?: String[];
    changeVideoFormat?: (newBand: any) => void;
    selectedVideoFormat: String;
};

export type SelectVideoProps = videoProps;

const SelectVideoFormat: React.FC<SelectVideoProps> = ({ inputVideoFormats, changeVideoFormat, selectedVideoFormat }) => {
    // const [selected, setSelected] = useState<Boolean>(false);

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
            {selectedVideoFormat ? <h3>Video Format:</h3> :
                <div className='no-input'>Bitte wählen Sie ein Videoformat aus:</div>
            }
            <Select
                showSearch
                placeholder="Aktives Band"
                options={videoFormatOptions}
                onChange={changeVideoFormat}
            />
        </div >
    );
};

export default SelectVideoFormat;
