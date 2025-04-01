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

import { getDurationString, getTimeDifferrenceInSeconds } from '../../../util/date-migrate-TS';
import Icon from '../../Icons';
import styles from './styles.module.scss';

type ElapsedTimeWidgetProps = {
  pastDate: Date;
};

export default function ElapsedTimeWidget({ pastDate }: ElapsedTimeWidgetProps) {
  const timeInS = getTimeDifferrenceInSeconds(pastDate, new Date());
  const durationString = getDurationString(timeInS);
  return (
    <div className={styles.container}>
      <div className={styles.duration}>{durationString}</div>
      <Icon iconName="CLOCK_FAST" className={styles.icon} />
    </div>
  );
}
