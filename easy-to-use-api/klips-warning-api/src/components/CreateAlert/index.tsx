import React from 'react';
import { Card } from "@rneui/base";
import { View, Text, ColorValue } from "react-native";

import { ClockCircleOutlined, ExclamationCircleOutlined, PushpinOutlined } from '@ant-design/icons';

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

  return (
    <View id='warning'>
      <Card containerStyle={{
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        shadowOpacity: 0.26,
        backgroundColor: color,
        borderColor: color,
        width: 650,
        padding: 0,
        borderWidth: 2,
        borderRadius: 10
      }}>
        <View
          style={{
            padding: 10,
            margin: 2,
            flexDirection: 'row',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: 'white',
          }}
        >
          <View style={{
            flexDirection: 'row',
          }}
          >
            <ClockCircleOutlined style={{
              color: 'white',
              paddingRight: 10,
            }}
            />
            <Text style={{
              color: 'white',
            }}
            >{currentDate.toLocaleString()}</Text>
          </View>
          <View style={{
            flexDirection: 'row',
          }}
          >
            <PushpinOutlined style={{
              color: 'white',
              paddingRight: 10,
            }}
            />
            <Text style={{
              color: 'white',
            }}>
              {location} </Text>
          </View>
        </View>
        <View
          style={{
            padding: 10,
            alignContent: 'center',
            flexDirection: 'row',
          }}
        >
          <ExclamationCircleOutlined style={{
            fontSize: 40,
            color: 'white',
            paddingRight: 10,
          }} />
          <View style={{
            alignItems: "center",
            flexDirection: 'row',
          }}>
            <Text style={{
              padding: 10,
              color: 'white',
              fontSize: 16,
            }}
            >
              {warning.notification}:
            </Text>
            <Text style={{
              color: 'white',
              fontSize: 16,
            }}
            >
              {warning.text}   ({date})
            </Text>
          </View>
        </View>
        <View>
          <Text style={{
            padding: 20,
            paddingTop: 0,
            color: 'white',
            textAlign: 'right'
          }}
          >
            Temperaturparameter: {temperatureParameter}
          </Text>
        </View>
        {/* <button className='alert-refresh' id='alert-refresh-warning' onClick="location.reload();"><i id='icon-warning'
                className="fa-solid fa-rotate-right"></i></button> */}
      </Card>

    </View>
  );
};

export default CreateAlert;

