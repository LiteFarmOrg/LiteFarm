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
import styles from './styles.module.scss';

const ProfitabilityWidgetSkeleton = () => (
  <div className={styles.skeleton} aria-busy="true" aria-label="Loading profitability widget">
    <div className={clsx(styles.skeletonPlaceholder, styles.skeletonHeader)} />
    <div className={clsx(styles.skeletonPlaceholder, styles.skeletonKpiHero)} />
    <div className={styles.skeletonKpiCompactRow}>
      <div className={clsx(styles.skeletonPlaceholder, styles.skeletonKpiCompact)} />
      <div className={clsx(styles.skeletonPlaceholder, styles.skeletonKpiCompact)} />
      <div className={clsx(styles.skeletonPlaceholder, styles.skeletonKpiCompact)} />
    </div>
    <div className={styles.skeletonBarsRow}>
      <div className={clsx(styles.skeletonPlaceholder, styles.skeletonBar)} />
      <div className={clsx(styles.skeletonPlaceholder, styles.skeletonBar)} />
    </div>
    <div className={clsx(styles.skeletonPlaceholder, styles.skeletonTable)} />
  </div>
);

export default ProfitabilityWidgetSkeleton;
