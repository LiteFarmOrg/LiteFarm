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
import TextButton from '../../Form/Button/TextButton';
import type { KPI } from '../index';

export const KPITile = ({ icon, label, count, onClick }: KPI) => (
  <TextButton className={styles.tile} onClick={onClick}>
    <div className={styles.icon}>{icon}</div>
    <div className={styles.tileText}>
      <Main className={styles.tileLabel}>{label}</Main>
      <Main className={styles.tileCountLabel}>{count}</Main>
    </div>
  </TextButton>
);
