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

import { ReactElement } from 'react';
import { TFunction } from 'react-i18next';
import { ReactComponent as WindIcon } from '../../assets/images/weather/wind.svg';
import { ReactComponent as RainfallIcon } from '../../assets/images/weather/droplets.svg';
import ThemometerWarmIcon from '../../assets/images/weather/thermometer-warm.svg';
import WeatherIcon from '../WeatherBoard/WeatherIcon';
import PivotIcon from '../../assets/images/irrigation/pivot-icon.svg';
import ClockIcon from '../../assets/images/clock-stopwatch.svg';
import { convertEsciReadingValue, getReadingUnit } from '../../containers/SensorReadings/v2/utils';
import weatherBoardUtil from '../../containers/WeatherBoard/utils';
import { System } from '../../types';
import { SensorReadingTypes } from '../../store/api/types';
import styles from './styles.module.scss';

type TemperatureUnit = 'C';
type WindSpeedUnit = 'm/s';
type CumulativeRainfallUnit = 'mm';

export type IrrigationPrescription = {
  //   uuid: string; // double check we're querying on the uuid and not the pk, otherwise id: number;

  //   location_id: string; // LiteFarm location_id (uuid)
  //   recommended_start: string; // ISO datetime string

  //   pivot: {
  //     center: { lat: number; lng: number };
  //     radius: number; // in meters
  //   };

  metadata: {
    weather_forecast: {
      temperature: number;
      temperature_unit: TemperatureUnit;
      wind_speed: number;
      wind_speed_unit: WindSpeedUnit;
      cumulative_rainfall: number;
      cumulative_rainfall_unit: CumulativeRainfallUnit;
      et_rate: number;
      et_rate_unit: string;
      weather_icon: string;
    };
  };

  estimated_time: number;
  estimated_time_unit: string;

  /*----------------
    // Almost certainly not to be included
    // I think they said we have to calculate this? I think our backend would be the right place to do it */
  estimated_water_consumption?: number;
  estimated_water_consumption_unit?: string;
  /*----------------*/
};

export const dummyIP = {
  metadata: {
    weather_forecast: {
      temperature: 5,
      temperature_unit: 'C' as TemperatureUnit,
      wind_speed: 2,
      wind_speed_unit: 'm/s' as WindSpeedUnit,
      cumulative_rainfall: 20,
      cumulative_rainfall_unit: 'mm' as CumulativeRainfallUnit,
      et_rate: 2,
      et_rate_unit: 'mm/d',
      weather_icon: '01d',
    },
  },

  // Estimations -- I forget if we have asked about hours. Check
  estimated_time: 14,
  estimated_time_unit: 'h',

  /*----------------
    // Almost certainly not to be included
    // I think they said we have to calculate this? I think our backend would be the right place to do it */
  estimated_water_consumption: 79,
  estimated_water_consumption_unit: 'AF',
  /*----------------*/
};

export const IconAndText = ({ Icon, text }: { Icon: ReactElement; text: string }) => {
  return (
    <span className={styles.iconAndText}>
      {Icon}
      {text}
    </span>
  );
};

const WEATHER_PARAMS: Extract<
  SensorReadingTypes,
  'temperature' | 'wind_speed' | 'cumulative_rainfall'
>[] = ['temperature', 'wind_speed', 'cumulative_rainfall'];

export const generateKPIData = (ipData: IrrigationPrescription, t: TFunction, system: System) => {
  const {
    metadata: { weather_forecast },
    estimated_time,
    estimated_time_unit,
    estimated_water_consumption,
    estimated_water_consumption_unit,
  } = ipData;

  const { et_rate, et_rate_unit, weather_icon } = weather_forecast;

  const [temperatureText, windSpeedText, cumulativeRainfallText] = WEATHER_PARAMS.map((param) => {
    const value = convertEsciReadingValue(weather_forecast[param], param, system);
    const displayUnit = getReadingUnit(param, system, weather_forecast[`${param}_unit`]);

    return `${value}${displayUnit}`;
  });

  const etRateText = `${et_rate} ${et_rate_unit}`;

  return [
    {
      label: t('SENSOR.READING.TEMPERATURE'),
      data: (
        <span className={styles.temperatureData}>
          <span>{temperatureText}</span>
          <WeatherIcon name={weatherBoardUtil.getIcon(weather_icon)} />
        </span>
      ),
      iconURL: ThemometerWarmIcon,
    },
    {
      label: t('SENSOR.READING.WIND_SPEED'),
      data: <IconAndText Icon={<WindIcon />} text={windSpeedText} />,
    },
    {
      label: t('SENSOR.READING.CUMULATIVE_RAINFALL'),
      data: <IconAndText Icon={<RainfallIcon />} text={cumulativeRainfallText} />,
    },
    {
      label: t('IRRIGATION_PRESCRIPTION.ET_RATE'),
      data: <IconAndText Icon={<WindIcon />} text={etRateText} />,
    },
    {
      label: t('common:ESTIMATED_TIME'),
      data: (
        <>
          <b>{estimated_time}</b>
          {estimated_time_unit}
        </>
      ),
      iconURL: ClockIcon,
    },
    {
      label: t('IRRIGATION_PRESCRIPTION.ESTIMATED_WATER_CONSUMPTION'),
      data: (
        <>
          <b>{estimated_water_consumption}</b>
          {estimated_water_consumption_unit}
        </>
      ),
      iconURL: PivotIcon,
    },
  ];
};
