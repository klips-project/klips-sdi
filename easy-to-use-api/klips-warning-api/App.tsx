import React, { useEffect, useMemo, useState } from 'react';
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
  type PromiseResponse = { response: ResultObject[] };
  type GeometryObject = {
    wktGeometry: any,
    geoJSONGeometry: any
  };
  const [warning, setWarning] = useState<NotificationInput>(notificationOptions[0]);
  const [criticalDate, setCriticalDate] = useState<Date | undefined>();
  const [params, setParams] = useState<Params | null>(null);
  const [temperature, setTemperature] = useState<PromiseResponse>({ response: [] });
  const [geometry, setGeometry] = useState<GeometryObject | null>();
  const [region, setRegion] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [widget, setWidget] = useState<any>(<></>)

  // Get url
  const url = Linking.useURL();

  useEffect(() => {
    if (!url) {
      return;
    }

    const { queryParams } = Linking.parse(url);
    setParams(queryParams as Params);
  }, [url]);

  useEffect(() => {
    if (!params) {
      return;
    }

    setRegion(`${params.region}`);

    // get WKT anf GeoJSON
    const wktReader = new WKTParser();
    const geoJSONWriter = new GeoJSONWriter();

    const wktGeometry = wktReader.read(params.geom);
    const geoJSONGeometry = geoJSONWriter.write(wktGeometry);

    setGeometry({
      wktGeometry: wktGeometry,
      geoJSONGeometry: geoJSONGeometry
    })
  }, [params]);

  useMemo(() => {
    // get data
    setState('loading');

    if (!region || !geometry) {
      return;
    }

    if (params?.geom?.includes('POLYGON')) {
      fetchTemperaturePolygon(region, geometry.geoJSONGeometry)
        .then((response) => {
          setState('success');
          setTemperature({
            response: response.values
          });
        })
        .catch((error) => {
          console.log(error)
        });
    } else if (params?.geom?.includes('POINT')) {
      fetchTemperaturePoint(region, geometry.wktGeometry.getCoordinates()[0])
        .then((response) => {
          setState('success');
          setTemperature({
            response: response.values
          });
        })
        .catch((error) => {
          console.log(error)
        });

    };

  }, [region, geometry]);

  useEffect(() => {
    if (!params) {
      return;
    };

    // get band
    let band: keyof ResultObject = 'band_1'
    if (params.band === 'perceived') {
      band = 'band_2'
    } else if (params.band === 'difference') {
      band = 'band_3'
    };

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

    console.log(resultThreshold)

    if (resultThreshold.red.length > 0) {
      setWarning(notificationOptions[3])
      setCriticalDate(resultThreshold.red[0].timestamp);
    } else if (resultThreshold.orange.length > 0) {
      setWarning(notificationOptions[2]);
      setCriticalDate(resultThreshold.orange[0].timestamp);
    } else if (resultThreshold.green.length > 0) {
      setWarning(notificationOptions[1]);
      setCriticalDate(resultThreshold.green[0].timestamp);
    };
  }, [params, temperature]);

  useEffect(() => {
    if (!params) {
      return;
    };

    if (params.format === 'traffic-light') {
      switch (warning.name) {
        case 'blue':
          setWidget(<img src='./src/resources/traffic-light-red.svg' />)
          break;
        case 'orange':
          setWidget(<img src='./src/resources/traffic-light-yellow.svg' />)
          break;
        case 'red':
          setWidget(<img src='./src/resources/traffic-light-red.svg' />)
          break;
        default:
          setWidget(<img src='./src/resources/traffic-light-green.svg' />)
      };
    }

    if (params.format === 'info-board') {
      // Get Timeframe
      const date = new Date();

      // Check for consistent thresholds and create widget
      if (params.thresholdgreen! > params.thresholdorange! ||
        params.thresholdgreen! > params.thresholdred! ||
        params.thresholdorange! > params.thresholdred!
      ) {
        setWidget(<Alert
          message="Grenzwerte sind nicht in einer logischen Reihenfolge. Bitte passen Sie die Reihenfolge an."
          type="error"
        />)
      } else {
        setWidget(<CreateAlert
          warning={warning}
          location={params.geom}
          currentDate={date}
          band={params.band}
          criticalDate={criticalDate}
        />)
      };
    }
  }, [params, warning]);

  return (
    <View>
      {state === 'loading' ? (
        <>Loading...</>
      ) : <>{widget}</>}
    </View>
  );
};

export default App;
