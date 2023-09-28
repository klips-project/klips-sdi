import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import CreateAlert from './src/components/CreateAlert';
import temperature from './src/components/GetData';
import params from './src/Url';
import { notificationOptions } from './src/constants';
import { NotificationInput, ResultObject, ResultThreshold } from './src/types';

import { Alert } from 'antd';

const App: React.FC = () => {
    const [warning, setWarning] = useState<NotificationInput>(notificationOptions[0]);
    const [criticalDate, setCriticalDate] = useState<Date | undefined>();

    let band: keyof ResultObject = 'band_1'
    if (params.band === 'perceived') {
        band = 'band_2'
    } else if (params.band === 'difference') {
        band = 'band_3'
    }
    const resultThreshold: ResultThreshold = {
        green: temperature.filter((obj: ResultObject) => {
            return obj[band] > params.thresholdgreen!
        }),
        orange: temperature.filter((obj: ResultObject) => {
            return obj[band] > params.thresholdorange!
        }),
        red: temperature.filter((obj: ResultObject) => {
            return obj[band] > params.thresholdred!
        }),
    };
    
    useEffect(() => {
        if (resultThreshold.red.length > 0) {
            setWarning(notificationOptions[3])
            setCriticalDate(resultThreshold.red[0].timestamp);
        } else if (resultThreshold.orange.length > 0) {
            setWarning(notificationOptions[2]);
            setCriticalDate(resultThreshold.orange[0].timestamp);
        } else if (resultThreshold.green.length > 0) {
            setWarning(notificationOptions[1]);
        };
    }, [resultThreshold, notificationOptions, warning]);

    // Get Timeframe
    const date = new Date();

    if (!params ||
        !date ||
        !params.band ||
        !params.geom
    ) {
        return;
    };

    // Check for consistent thresholds and create widget
    let widget: any = <></>;
    if (params.thresholdgreen! > params.thresholdorange! ||
        params.thresholdgreen! > params.thresholdred! ||
        params.thresholdorange! > params.thresholdred!
    ) {
        widget = <Alert
            message="Grenzwerte sind nicht in einer logischen Reihenfolge. Bitte passen Sie die Reihenfolge an."
            type="error"
        />
    } else {
        widget = <CreateAlert
            warning={warning}
            location={params.geom}
            currentDate={date}
            band={params.band}
            criticalDate={criticalDate}
        />
    };

    return (
        <View>
            {widget}
        </View>
    );
};

export default App;
