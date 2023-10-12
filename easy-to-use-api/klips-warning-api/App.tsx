import React, { useState } from 'react';
import { View } from 'react-native';
import * as Linking from 'expo-linking';

// @ts-ignore
import WKTParser from 'jsts/org/locationtech/jts/io/WKTParser';
// @ts-ignore
import GeoJSONWriter from 'jsts/org/locationtech/jts/io/GeoJSONWriter';

import CreateAlert from './src/components/CreateAlert';
import { fetchTemperaturePoint, fetchTemperaturePolygon } from './src/components/GetData';
import { notificationOptions } from './src/constants';
import { NotificationInput, ResultObject, ResultThreshold, Params } from './src/types';

import { Alert } from 'antd';

const App: React.FC = () => {
    const [warning, setWarning] = useState<NotificationInput>(notificationOptions[0]);
    const [criticalDate, setCriticalDate] = useState<Date | undefined>();

    // Get url
    const url = Linking.useURL();

    if (!url) {
        return;
    }
    const { queryParams } = Linking.parse(url);
    const params = queryParams as Params;

    // get WKT
    const wktReader = new WKTParser();
    const wktGeometry = wktReader.read(params.geom);

    // get GeoJSON
    const geoJSONWriter = new GeoJSONWriter();
    const geoJSONGeometry = geoJSONWriter.write(wktGeometry);

    // get data
    type PromiseResponse = { response: ResultObject[] };
    const temperature: PromiseResponse = { response: [] };
    if (params.geom?.includes('POLYGON')) {
        fetchTemperaturePolygon(params, geoJSONGeometry)
            .then(response => {
                temperature.response = response.values;
            })
            .catch((error) => {
                console.log(error)
            });
    } else {
        fetchTemperaturePoint(params, wktGeometry.getCoordinates()[0])
            .then(response => {
                temperature.response = response.values;
            })
            .catch((error) => {
                console.log(error)
            });
    };
    console.log(temperature.response);


    let band: keyof ResultObject = 'band_1'
    if (params.band === 'perceived') {
        band = 'band_2'
    } else if (params.band === 'difference') {
        band = 'band_3'
    }

    const resultThreshold: ResultThreshold = {
        green: temperature.response.filter((obj: ResultObject) => {
            return obj[band] > (params.thresholdgreen!);
        }),
        orange: temperature.response.filter((obj: ResultObject) => {
            return obj[band] > Number(params.thresholdorange!);
        }),
        red: temperature.response.filter((obj: ResultObject) => {
            return obj[band] > Number(params.thresholdred!);
        }),
    };

    if (resultThreshold.red.length > 0) {
        setWarning(notificationOptions[3])
        setCriticalDate(resultThreshold.red[0].timestamp);
    } else if (resultThreshold.orange.length > 0) {
        setWarning(notificationOptions[2]);
        setCriticalDate(resultThreshold.orange[0].timestamp);
    } else if (resultThreshold.green.length > 0) {
        setWarning(notificationOptions[1]);
    };

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
