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
import type { ForecastDay } from '../../containers/WeatherForecast/utils';
import type { WeatherForecastSlot } from '../../store/api/types';
import DayPillRow from './DayPillRow';
import DayWeatherSummary from './DayWeatherSummary';
import TimeStrip from '../TimeStrip';
import { LoadingSpinner } from '../Loading/LoadingV2';
import type { System } from '../../types';
import styles from './styles.module.scss';

export interface PureWeatherForecastProps {
  isLoading: boolean;
  days: ForecastDay[];
  dayPillLabels: string[];
  selectedDayIndex: number;
  selectedSlot?: WeatherForecastSlot;
  selectedSlotIndex: number;
  slots: WeatherForecastSlot[];
  offsetSeconds: number;
  system: System;
  locale: string;
  onDayClick: (dayIndex: number) => void;
  onSelectSlot: (slotIndex: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const PureWeatherForecast = ({
  isLoading,
  days,
  dayPillLabels,
  selectedDayIndex,
  selectedSlot,
  selectedSlotIndex,
  slots,
  offsetSeconds,
  system,
  locale,
  onDayClick,
  onSelectSlot,
  onPrev,
  onNext,
}: PureWeatherForecastProps) => {
  const { t } = useTranslation();
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>{t('WEATHER.TITLE')}</h2>
      {isLoading && (
        <div className={styles.spinner}>
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && selectedSlot && (
        <>
          <DayPillRow
            days={days}
            labels={dayPillLabels}
            selectedDayIndex={selectedDayIndex}
            onDayClick={onDayClick}
          />
          <DayWeatherSummary
            day={days[selectedDayIndex]}
            selectedSlot={selectedSlot}
            system={system}
            locale={locale}
          />
          <TimeStrip
            slots={slots}
            selectedSlotIndex={selectedSlotIndex}
            offsetSeconds={offsetSeconds}
            locale={locale}
            onSelect={onSelectSlot}
            onPrev={onPrev}
            onNext={onNext}
          />
        </>
      )}
    </section>
  );
};

export default PureWeatherForecast;
