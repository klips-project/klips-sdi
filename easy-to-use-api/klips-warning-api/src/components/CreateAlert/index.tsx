import React from 'react';
import { Card } from "@rneui/base";
import { StyleSheet, View, Text, ColorValue } from "react-native";

import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, PushpinOutlined, RedoOutlined } from '@ant-design/icons';

import { NotificationInput } from '../../types';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);

export interface WarningProps {
  warning: NotificationInput;
  location: String;
  currentDate: Date;
  band: String;
  criticalDate: Date | undefined;
};

export type CreateWarningProps = WarningProps;

const CreateAlert: React.FC<WarningProps> = ({ warning, location, currentDate, band, criticalDate }) => {

  const color = warning.color as ColorValue;

  const date = dayjs(criticalDate).format('DD.MM.YYYY HH:mm')

  let temperatureParameter = 'Physikalische Temperatur';
  switch (band) {
    case 'perceived':
      temperatureParameter = 'Gefühlte Temperatur'
      break;
    case 'difference':
      temperatureParameter = 'Temperaturdifferenz zum Umland'
      break;
    default:
      temperatureParameter = 'Physikalische Temperatur';
  };

  const style = StyleSheet.create({
    containerStyle: {
      shadowColor: 'black',
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      shadowOpacity: 0.26,
      backgroundColor: color,
      borderColor: color,
      width: 'auto',
      padding: 0,
      borderWidth: 2,
      borderRadius: 10
    },
    box: {
      padding: 10,
      margin: 2,
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: 'white',
    },
    header: {
      flexDirection: 'row',
    },
    icon: {
      color: 'white',
      paddingRight: 10,
    },
    color: {
      color: 'white',
    },
    boxIcon: {
      padding: 10,
      alignContent: 'center',
      flexDirection: 'row',
    },
    warningCircle: {
      fontSize: 40,
      color: 'white',
      paddingRight: 10,
    },
    text: {
      color: 'white',
      fontSize: 16,
    },
    textNotification: {
      padding: 10,
      color: 'white',
      fontSize: 16,
    },
    subtext: {
      padding: 20,
      paddingTop: 0,
      color: 'white',
      textAlign: 'right'
    },
    textBox: {
      alignItems: "center",
      flexDirection: 'row',
    },
    return: {
      color: 'white',
      fontSize: 20,
      marginLeft: 5,
    },
  });

  return (
    <View id='warning'>
      <Card containerStyle={style.containerStyle}>
        <View
          style={style.box}
        >
          <View style={style.header}
          >
            <ClockCircleOutlined style={style.icon}
            />
            <Text style={style.color}
            >{currentDate.toLocaleString()}</Text>
          </View>
          <View style={style.header}
          >
            <PushpinOutlined style={style.icon}
            />
            <Text style={style.color}>
              {location} </Text>
          </View>
        </View>
        <View
          style={style.boxIcon}
        >
          {warning.name === 'green' ?
            <CheckCircleOutlined style={style.warningCircle} /> :
            <ExclamationCircleOutlined style={style.warningCircle} />}
          <View style={style.textBox}>
            <Text style={style.textNotification}
            >
              {warning.notification}:
            </Text>
            <Text style={style.text}
            >
              {warning.text}   ({date})
            </Text>
            <RedoOutlined
              onClick={() => window.location.reload()}
              style={style.return}
            ></RedoOutlined>
          </View>
        </View>
        <View>
          <Text style={style.subtext}
          >
            Temperaturparameter: {temperatureParameter}
          </Text>
        </View>
      </Card>

    </View>
  );
};

export default CreateAlert;

