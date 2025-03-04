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

export type SensorReadingKPIprops = TMeasurement & {
  colorHex?: string;
  rest?: React.HTMLAttributes<HTMLDivElement>;
};

export default function SensorReadingKPI({
  measurement,
  value,
  unit,
  colorHex = '#000000',
  ...rest
}: SensorReadingKPIprops) {
  // Ensure a 6 digit hex plus hash, if less than 7 digits force it to a 3 digit color code and turn that into 6 digit.
  const color =
    colorHex.length < 7
      ? `${colorHex.slice(0, 4).replaceAll('#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])', '#$1$1$2$2$3$3')}`
      : `${colorHex.slice(0, 7)}`;
  // 0D is the code for 5% opacity, 95% transparency
  const style = {
    '--color': color,
    '--colorWithOpacity': `${color}0D`,
  } as React.CSSProperties;
  return (
    <div {...rest} className={styles.sensorReadingKpi} style={style}>
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
