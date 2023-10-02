import * as React from 'react';
import { Input } from 'antd';
import { useState } from 'react';

export interface titleProps {
    changeTitle?: (newPersonalTitle: any) => void;
};

export type WritePersonalTitleProps = titleProps;

const WritePersonalTitle: React.FC<WritePersonalTitleProps> = ({ changeTitle }) => {
    const [personalTitle, setPersonalTitle] = useState();

    const writePersonalTitle = (event: any) => {
        setPersonalTitle(event.target.value);
        changeTitle?.(event.target.value);
    }

    return (
        <div className='personal-title-selector'>
            {personalTitle ? <h3>Titel:</h3> :
                <div>Bitte geben Sie einen Titel an:</div>
            }
            <Input
                placeholder="Titel"
                value={personalTitle}
                onChange={writePersonalTitle}
            />
        </div>
    );
};

export default WritePersonalTitle;
