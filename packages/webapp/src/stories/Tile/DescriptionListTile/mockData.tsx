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

import { ReactComponent as Themometer } from '../../../assets/images/map/themometer.svg';
import WeatherIcon from '../../../components/WeatherBoard/WeatherIcon';

export const mockTextData = [
  { label: 'Temperature', data: '23°C' },
  { label: 'Wind speed & direction', data: '8km/h SW' },
  { label: 'Cumulative rainfall', data: '20mm' },
  { label: 'Relative Humidity', data: '33%' },
  { label: 'Barometric Pressure', data: '8hPa' },
  { label: 'Solar radiation', data: '20W/m2' },
  { label: 'Rainfall rate', data: '2mm/h' },
];

export const mockIconData = [
  {
    label: 'Temperature',
    data: (
      <>
        <Themometer />
        23°C
        <WeatherIcon name="wi-day-sunny" />
      </>
    ),
  },
  {
    label: 'Wind speed & direction',
    data: (
      <>
        <Themometer />
        8km/h <Themometer />
        SW
      </>
    ),
  },
  {
    label: 'Cumulative rainfall',
    data: (
      <>
        <Themometer />
        20mm
      </>
    ),
  },
  { label: 'Relative Humidity', data: '33%' },
  {
    label: 'Barometric Pressure',
    data: (
      <>
        <Themometer />
        8hPa
      </>
    ),
  },
  {
    label: 'Solar radiation',
    data: (
      <>
        <Themometer />
        20W/m2
      </>
    ),
  },
  {
    label: 'Rainfall rate',
    data: (
      <>
        <Themometer />
        2mm/h
      </>
    ),
  },
];
