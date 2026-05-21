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

import { useTranslation } from 'react-i18next';
import type { ForecastDay, Measurement } from '../../containers/WeatherForecast/selectors';
import type { WeatherForecastSlot } from '../../store/api/types';
import DayPillRow from './DayPillRow';
import DayWeatherSummary from './DayWeatherSummary';
import TimeStrip from './TimeStrip';
import styles from './styles.module.scss';

export interface PureWeatherForecastProps {
  days: ForecastDay[];
  dayPillLabels: string[];
  selectedDayIndex: number;
  selectedSlot: WeatherForecastSlot;
  selectedSlotIndex: number;
  slots: WeatherForecastSlot[];
  offsetSeconds: number;
  measurement: Measurement;
  locale: string;
  onDayClick: (dayIndex: number) => void;
  onSelectSlot: (slotIndex: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

const PureWeatherForecast = ({
  days,
  dayPillLabels,
  selectedDayIndex,
  selectedSlot,
  selectedSlotIndex,
  slots,
  offsetSeconds,
  measurement,
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
      <DayPillRow
        days={days}
        labels={dayPillLabels}
        selectedDayIndex={selectedDayIndex}
        frostLabel={t('WEATHER.FROST_RISK')}
        onDayClick={onDayClick}
      />
      <DayWeatherSummary
        day={days[selectedDayIndex]}
        selectedSlot={selectedSlot}
        measurement={measurement}
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
    </section>
  );
};

export default PureWeatherForecast;
