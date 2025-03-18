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

export interface SensorReadingKPIprops extends TMeasurement, React.HTMLAttributes<HTMLDivElement> {
  color?: string;
}

/**
 * A component that displays a sensor reading KPI (Key Performance Indicator).
 * AI-assisted JsDoc
 *
 * @component
 * @param props - The props for the component.
 * @param props.measurement - The name of the measurement (e.g., "Temperature").
 * @param props.value - The value of the sensor reading.
 * @param props.unit - The unit of measurement (e.g., "°C", "ppm").
 * @param props.color - The primary color for styling - should be a six digit hex color.
 * @param props.rest - Additional props to spread onto the root div.
 * @returns The rendered SensorReadingKPI component.
 */
export default function SensorReadingKPI({
  measurement,
  value,
  unit,
  color = '#000000',
  ...rest
}: SensorReadingKPIprops) {
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
