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
import type { ForecastDay, Measurement } from '../../../containers/WeatherForecast/selectors';
import {
  convertPrecipitationForDisplay,
  convertTempForDisplay,
  convertWindForDisplay,
  formatLongDate,
} from '../../../containers/WeatherForecast/selectors';
import type { WeatherForecastSlot } from '../../../store/api/types';
import DescriptionList, { LabelSize } from '../../Tile/DescriptionList';
import WeatherIcon from '../../WeatherBoard/WeatherIcon';
import weatherBoardUtil from '../../../containers/WeatherBoard/utils';
import FrostBanner from '../FrostBanner';
import styles from './styles.module.scss';

interface DayWeatherSummaryProps {
  day: ForecastDay;
  selectedSlot: WeatherForecastSlot;
  measurement: Measurement;
  locale: string;
}

const DayWeatherSummary = ({ day, selectedSlot, measurement, locale }: DayWeatherSummaryProps) => {
  const { t } = useTranslation();
  const temp = convertTempForDisplay(selectedSlot.tempC, measurement);
  const wind = convertWindForDisplay(selectedSlot.windMs, measurement);
  const precipitation = convertPrecipitationForDisplay(selectedSlot.rainMm3h, measurement);

  return (
    <div className={styles.summary}>
      {day.isFrost && <FrostBanner measurement={measurement} />}
      <div className={styles.titleRow}>
        <span className={styles.date}>{formatLongDate(day, locale)}</span>
        <div className={styles.tempBlock}>
          <span className={styles.temp}>{temp}</span>
          <WeatherIcon name={weatherBoardUtil.getIcon(selectedSlot.iconCode)} />
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
            label: t('WEATHER.HUMIDITY'),
            data: `${selectedSlot.humidity}%`,
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

export default DayWeatherSummary;
