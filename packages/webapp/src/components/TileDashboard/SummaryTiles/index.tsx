/*
 *  Copyright 2024 LiteFarm.org
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

import styles from './styles.module.scss';
import { Main } from '../../Typography';

interface SummaryTilesProps {
  totalCount: number;
  categoryCount: number;
  categoryLabel: string;
}

export const SummaryTiles = ({ totalCount, categoryCount, categoryLabel }: SummaryTilesProps) => (
  <div className={styles.summaryTiles}>
    <div className={styles.totalCount}>
      <Main className={styles.countLabel}>total</Main>
      <Main className={styles.countText}>{totalCount}</Main>
    </div>
    <div className={styles.typeCount}>
      <Main className={styles.countLabel}>{categoryLabel}</Main>
      <Main className={styles.countText}>{categoryCount}</Main>
    </div>
  </div>
);
