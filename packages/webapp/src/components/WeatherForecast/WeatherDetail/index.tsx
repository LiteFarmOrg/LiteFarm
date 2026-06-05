/*
 *  Copyright 2026 LiteFarm.org
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

import { useTranslation } from 'react-i18next';
import type { ForecastDay } from '../../../containers/WeatherForecast/utils';
import {
  convertPrecipitationForDisplay,
  convertTempForDisplay,
  convertWindForDisplay,
  formatLongDate,
} from '../../../containers/WeatherForecast/utils';
import type { WeatherForecastSlot } from '../../../store/api/types';
import DescriptionList, { LabelSize } from '../../Tile/DescriptionList';
import WeatherIcon from '../../WeatherBoard/WeatherIcon';
import weatherBoardUtil from '../../../containers/WeatherBoard/utils';
import FrostBanner from '../FrostBanner';
import type { System } from '../../../types';
import styles from './styles.module.scss';

interface WeatherDetailProps {
  day: ForecastDay;
  selectedSlot: WeatherForecastSlot;
  system: System;
  locale: string;
}

const WeatherDetail = ({ day, selectedSlot, system, locale }: WeatherDetailProps) => {
  const { t } = useTranslation();
  const { tempC, windMs, rainMm3h, snowMm3h, humidity, pop, iconCode } = selectedSlot;
  const temp = convertTempForDisplay(tempC, system);
  const wind = convertWindForDisplay(windMs, system);
  const precipitation = convertPrecipitationForDisplay(rainMm3h, snowMm3h, system);

  return (
    <div className={styles.summary}>
      {day.isFrost && <FrostBanner system={system} />}
      <div className={styles.titleRow}>
        <span className={styles.date}>{formatLongDate(day, locale)}</span>
        <div className={styles.tempBlock}>
          <span className={styles.temp}>{temp}</span>
          <WeatherIcon name={weatherBoardUtil.getIcon(iconCode)} />
        </div>
      </div>
      <DescriptionList
        className={styles.metrics}
        descriptionListTilesProps={[
          {
            label: t('WEATHER.PRECIPITATION'),
            data: precipitation,
            labelSize: LabelSize.SMALL,
          },
          {
            label: t('common:PROBABILITY'),
            data: `${Math.floor(pop * 100)}%`,
            labelSize: LabelSize.SMALL,
          },
          {
            label: t('WEATHER.HUMIDITY'),
            data: `${humidity}%`,
            labelSize: LabelSize.SMALL,
          },
          {
            label: t('SENSOR.READING.WIND_SPEED'),
            data: wind,
            labelSize: LabelSize.SMALL,
          },
        ]}
      />
    </div>
  );
};

export default WeatherDetail;
