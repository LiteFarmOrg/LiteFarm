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

import { IconAndText } from '../../../components/IPDetailKPI/util';
import { ReactComponent as WindIcon } from '../../../assets/images/weather/wind.svg';
import { ReactComponent as RainfallIcon } from '../../../assets/images/weather/droplets.svg';
import { ReactComponent as ThemometerWarmIcon } from '../../../assets/images/weather/thermometer-warm.svg';
import WeatherIcon from '../../../components/WeatherBoard/WeatherIcon';
import PivotIcon from '../../../assets/images/irrigation/pivot-icon.svg';
import ClockIcon from '../../../assets/images/clock-stopwatch.svg';
import styles from './styles.module.scss';
import ipKPIStyle from '../../../components/IPDetailKPI/styles.module.scss';

export const mockTextData = [
  { label: 'Temperature', data: '23°C' },
  { label: 'Wind speed & direction', data: '8km/h SW' },
  { label: 'Cumulative rainfall', data: '20mm' },
  { label: 'Relative Humidity', data: '33%' },
  { label: 'Barometric Pressure', data: '8hPa' },
  { label: 'Solar radiation', data: '20W/m2' },
  { label: 'Rainfall rate', data: '2mm/h' },
];

export const dataWithIconData = {
  label: 'Temperature',
  data: (
    <div className={ipKPIStyle.dataWithIcon}>
      <IconAndText Icon={<ThemometerWarmIcon />} text="23°C" />
    </div>
  ),
};

export const backgroundIconData = { label: 'Estimated time', data: '14h', iconURL: ClockIcon };

export const iPData = [
  {
    label: 'Temperature',
    data: (
      <span className={ipKPIStyle.temperatureData}>
        <IconAndText Icon={<ThemometerWarmIcon />} text="23°C" />
        <WeatherIcon name="wi-day-sunny" />
      </span>
    ),
  },
  {
    label: 'Wind speed',
    data: <IconAndText Icon={<WindIcon />} text="8 km/h" />,
  },
  {
    label: 'Cumulative rainfall',
    data: <IconAndText Icon={<RainfallIcon />} text="20mm" />,
  },
  {
    label: 'ET Rate',
    data: <IconAndText Icon={<WindIcon />} text="5mm / day" />,
  },
  { label: 'Estimated time', data: '14h', iconURL: ClockIcon },
  {
    label: 'Estimated water consumption',
    data: (
      <span className={styles.waterConsumption}>
        <span>
          <b>79</b>AF
        </span>
        out of remaining: <b>1079</b>AF
      </span>
    ),
    iconURL: PivotIcon,
  },
];
