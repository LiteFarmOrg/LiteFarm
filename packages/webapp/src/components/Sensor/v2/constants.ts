import { type SensorInSimpleTableFormat } from '../../../containers/AddSensors/types';
import i18n from '../../../locales/i18n';

export const SUPPORTED_DEVICE_TYPES = [
  'DRIP_LINE_PRESSURE_SENSOR',
  'IR_TEMPERATURE_SENSOR',
  'SOIL_WATER_POTENTIAL_SENSOR',
  'WEATHER_STATION',
  'WIND_SPEED_SENSOR',
];

// t('SENSOR.DEVICE_TYPES.DRIP_LINE_PRESSURE_SENSOR')
// t('SENSOR.DEVICE_TYPES.IR_TEMPERATURE_SENSOR')
// t('SENSOR.DEVICE_TYPES.SOIL_WATER_POTENTIAL_SENSOR')
// t('SENSOR.DEVICE_TYPES.WEATHER_STATION')
// t('SENSOR.DEVICE_TYPES.WIND_SPEED_SENSOR')

export const getDeviceType = (key: string) => {
  return SUPPORTED_DEVICE_TYPES.includes(key) ? i18n.t(`SENSOR.DEVICE_TYPES.${key}`) : key;
};
