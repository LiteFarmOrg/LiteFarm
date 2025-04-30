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
import type { SensorReadingTypes } from '../../store/api/types';
import type { IrrigationPrescription } from '../IrrigationPrescription/types';
import styles from './styles.module.scss';

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

const getETRateText = (value: number, unit: string, system: System) => {
  // TODO: LF-4810
  return `${value}${unit}`;
};

const getEstimatedTimeAndUnit = (value: number, unit: string) => {
  // TODO: LF-4810
  return { value: 14, unit: 'h' };
};

const getWaterConsumptionAndUnit = (value: number, unit: string) => {
  // TODO: LF-4810
  return { value: 79, unit: 'AF' };
};

const ValueAndUnit = ({ value, unit }: { value: number; unit: string }) => {
  return (
    <>
      <b>{value}</b>
      {unit}
    </>
  );
};

export const generateKPIData = (
  irrigationPrescription: IrrigationPrescription,
  t: TFunction,
  system: System,
) => {
  const {
    metadata: { weather_forecast },
    estimated_time,
    estimated_time_unit,
    estimated_water_consumption,
    estimated_water_consumption_unit,
  } = irrigationPrescription;

  const { et_rate, et_rate_unit, weather_icon_code } = weather_forecast;

  const [temperatureText, windSpeedText, cumulativeRainfallText] = WEATHER_PARAMS.map((param) => {
    const value = convertEsciReadingValue(weather_forecast[param], param, system);
    const displayUnit = getReadingUnit(param, system, weather_forecast[`${param}_unit`]);

    return `${value}${displayUnit}`;
  });

  return [
    {
      label: t('SENSOR.READING.TEMPERATURE'),
      data: (
        <span className={styles.temperatureData}>
          <span>{temperatureText}</span>
          <WeatherIcon name={weatherBoardUtil.getIcon(weather_icon_code)} />
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
      data: <IconAndText Icon={<WindIcon />} text={getETRateText(et_rate, et_rate_unit, system)} />,
    },
    {
      label: t('common:ESTIMATED_TIME'),
      data: <ValueAndUnit {...getEstimatedTimeAndUnit(estimated_time, estimated_time_unit)} />,
      iconURL: ClockIcon,
    },
    {
      label: t('IRRIGATION_PRESCRIPTION.ESTIMATED_WATER_CONSUMPTION'),
      data: (
        <ValueAndUnit
          {...getWaterConsumptionAndUnit(
            estimated_water_consumption,
            estimated_water_consumption_unit,
          )}
        />
      ),
      iconURL: PivotIcon,
    },
  ];
};
