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

import styles from './sensorKPI.module.scss';

export type TMeasurement = {
  measurement: string;
  value: string | number;
  unit: string;
};

export type SensorReadingKPIprops = TMeasurement;

export default function SensorReadingKPI({ measurement, value, unit }: SensorReadingKPIprops) {
  return (
    <div className={styles.sensorReadingKpi}>
      <div className={styles.opaqueLayer}>
        <div className={styles.measureText}>{measurement}</div>
        <div className={styles.valueText}>
          {value}
          {unit}
        </div>
      </div>
    </div>
  );
}
