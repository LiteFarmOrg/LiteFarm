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

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import type { ForecastDay } from '../../../containers/WeatherForecast/selectors';
import styles from './styles.module.scss';

export interface DayPillRowProps {
  days: ForecastDay[];
  selectedDayIndex: number;
  labels: string[];
  onDayClick: (dayIndex: number) => void;
}

const DayPillRow = ({ days, selectedDayIndex, labels, onDayClick }: DayPillRowProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.row}>
      {days.map((day, index) => {
        const selected = index === selectedDayIndex;
        return (
          <button
            key={day.localYmd}
            type="button"
            aria-pressed={selected}
            className={clsx(styles.pill, selected && styles.selected)}
            onClick={() => onDayClick(index)}
          >
            <span>{labels[index]}</span>
            {day.isFrost && <span className={styles.frostLabel}>{t('WEATHER.FROST_RISK')}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default DayPillRow;
