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

import { Tooltip } from '@mui/material';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { ReactComponent as TrendArrowIcon } from '../../assets/images/profitability/trend-arrow.svg';
import { TrendDirection } from './constants';
import styles from './styles.module.scss';

export interface TrendData {
  percent: number;
  direction: TrendDirection;
}

export type TrendBadgeProps = (TrendData & { variant?: never }) | { variant: 'insufficientData' };

const TrendBadge = (props: TrendBadgeProps) => {
  const { t } = useTranslation('profitability');

  if (props.variant === 'insufficientData') {
    return (
      <Tooltip title={t('KPI.NO_TREND_TOOLTIP')} placement="top" arrow>
        <span className={clsx(styles.trendBadge, styles.placeholder)}>
          <span className={styles.trendPercent}>-%</span>
          <TrendArrowIcon className={clsx(styles.trendArrow, styles.flat)} aria-hidden="true" />
          <span className={styles.trendSuffix}>
            <span className={styles.trendSuffixFull}>{t('KPI.YOY_TREND')}</span>
            <span className={styles.trendSuffixShort}>{t('KPI.YOY_TREND_SHORT')}</span>
          </span>
        </span>
      </Tooltip>
    );
  }

  const { percent, direction } = props;

  return (
    <Tooltip title={t('KPI.YOY_TOOLTIP')} placement="top" arrow>
      <span className={styles.trendBadge}>
        <TrendArrowIcon className={clsx(styles.trendArrow, styles[direction])} aria-hidden="true" />
        <span className={styles.trendPercent}>
          {direction === 'up' ? '+' : direction === 'down' ? '-' : ''}
          {percent}%
        </span>
        <span className={styles.trendSuffix}>
          <span className={styles.trendSuffixFull}>{t('KPI.YOY_TREND')}</span>
          <span className={styles.trendSuffixShort}>{t('KPI.YOY_TREND_SHORT')}</span>
        </span>
      </span>
    </Tooltip>
  );
};

export default TrendBadge;
