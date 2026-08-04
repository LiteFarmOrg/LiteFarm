/*
 *  Copyright 2025 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import i18n from '../../../locales/i18n';
import { SUPPORTED_SENSOR_NAMES } from '../../../store/api/types';
import { toTranslationKey } from '../../../util';

export const SUPPORTED_DEVICE_TYPES = SUPPORTED_SENSOR_NAMES.map(toTranslationKey);

// t('SENSOR.SENSOR_ARRAYS')
// t('SENSOR.DEVICE_TYPES.DRIPDRAIN_SENSOR')
// t('SENSOR.DEVICE_TYPES.DRIP_LINE_PRESSURE_SENSOR')
// t('SENSOR.DEVICE_TYPES.ET_SENSOR')
// t('SENSOR.DEVICE_TYPES.HUMIDITY_SENSOR')
// t('SENSOR.DEVICE_TYPES.IR_TEMPERATURE_SENSOR')
// t('SENSOR.DEVICE_TYPES.SDI-12_WEATHER_STATION')
// t('SENSOR.DEVICE_TYPES.SOIL_WATER_CONTENT_SENSOR')
// t('SENSOR.DEVICE_TYPES.SOIL_WATER_POTENTIAL_SENSOR')
// t('SENSOR.DEVICE_TYPES.TIPPING_BUCKET_RAIN_GAUGE')
// t('SENSOR.DEVICE_TYPES.TURBINE_FLOW_METER')
// t('SENSOR.DEVICE_TYPES.WEATHER_STATION')
// t('SENSOR.DEVICE_TYPES.WIND_SENSOR_VOLTAGE')
// t('SENSOR.DEVICE_TYPES.WIND_SPEED_SENSOR')

export const getSensorDeviceTypeLabel = (key: string) => {
  return SUPPORTED_DEVICE_TYPES.includes(key) ? i18n.t(`SENSOR.DEVICE_TYPES.${key}`) : key;
};
