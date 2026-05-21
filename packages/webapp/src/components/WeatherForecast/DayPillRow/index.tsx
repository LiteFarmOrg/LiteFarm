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

import clsx from 'clsx';
import type { ForecastDay } from '../../../containers/WeatherForecast/selectors';
import styles from './styles.module.scss';

export interface DayPillRowProps {
  days: ForecastDay[];
  selectedDayIndex: number;
  labels: string[];
  frostLabel: string;
  onDayClick: (dayIndex: number) => void;
}

const DayPillRow = ({
  days,
  selectedDayIndex,
  labels,
  frostLabel,
  onDayClick,
}: DayPillRowProps) => {
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
            <span className={styles.label}>{labels[index]}</span>
            {day.isFrost && (
              <>
                <span aria-hidden="true" className={styles.divider} />
                <span className={styles.frostLabel}>{frostLabel}</span>
                <span className={styles.visuallyHidden}>{frostLabel}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default DayPillRow;
