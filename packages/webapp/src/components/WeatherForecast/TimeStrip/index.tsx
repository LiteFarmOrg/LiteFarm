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

import { useEffect, useRef } from 'react';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { formatTimeChipLabel } from '../../../containers/WeatherForecast/selectors';
import type { WeatherForecastSlot } from '../../../store/api/types';
import styles from './styles.module.scss';

interface TimeStripProps {
  slots: WeatherForecastSlot[];
  selectedSlotIndex: number;
  offsetSeconds: number;
  locale: string;
  onSelect: (slotIndex: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const TimeStrip = ({
  slots,
  selectedSlotIndex,
  offsetSeconds,
  locale,
  onSelect,
  onPrev,
  onNext,
}: TimeStripProps) => {
  const { t } = useTranslation();
  const selectedRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [slots, selectedSlotIndex]);

  return (
    <div className={styles.strip}>
      <button
        type="button"
        className={styles.chevron}
        onClick={onPrev}
        disabled={!onPrev}
        aria-label={t('WEATHER.PREVIOUS_TIME_SLOT')}
      >
        <ChevronLeft />
      </button>
      <div className={styles.slotsScroll}>
        <div className={styles.slotsRow}>
          {slots.map((slot, index) => {
            const selected = index === selectedSlotIndex;
            return (
              <button
                key={slot.dt}
                ref={selected ? selectedRef : undefined}
                type="button"
                aria-pressed={selected}
                className={clsx(styles.chip, selected && styles.selected)}
                onClick={() => onSelect(index)}
              >
                {formatTimeChipLabel(slot.dt, offsetSeconds, locale)}
              </button>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        className={styles.chevron}
        onClick={onNext}
        disabled={!onNext}
        aria-label={t('WEATHER.NEXT_TIME_SLOT')}
      >
        <ChevronRight />
      </button>
    </div>
  );
};

export default TimeStrip;
