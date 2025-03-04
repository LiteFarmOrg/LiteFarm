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

import clsx from 'clsx';
import Icon from '../Icons';
import BentoLayout from '../Layout/BentoLayout';
import { StatusIndicatorPill, StatusIndicatorPillProps } from '../StatusIndicatorPill';
import styles from './sensorKPI.module.scss';
import { TMeasurement } from './SensorReadingKPI';

export interface SensorKPIprops extends React.HTMLAttributes<HTMLDivElement> {
  sensor: {
    id: string | number;
    status: StatusIndicatorPillProps;
  };
  discriminator: TMeasurement;
  measurements: TMeasurement[];
}

export interface MeasurementProps extends TMeasurement {
  rest?: React.HTMLAttributes<HTMLDivElement>;
}

const Measurement = ({ measurement, value, unit, ...rest }: TMeasurement) => (
  <div {...rest} className={styles.measurement}>
    <div className={styles.measureText}>{measurement}</div>
    <div className={styles.valueText}>
      {value}
      {unit}
    </div>
  </div>
);

export default function SensorKPI({
  sensor,
  discriminator,
  measurements,
  ...rest
}: SensorKPIprops) {
  const { measurement, value, unit } = discriminator;
  const { status, id } = sensor;
  return (
    <div {...rest} className={styles.sensorKpi}>
      <div className={clsx(styles.opaqueLayer, styles.gap8px)}>
        <div className={styles.topDetails}>
          <div className={styles.sensor}>
            <Icon iconName="SENSOR" className={styles.icon} />
            {id}
          </div>
          <div className={styles.discriminator}>
            <Icon iconName="RULER" className={styles.icon} />
            <div className={styles.discriminatorText}>
              {value}
              {unit}
            </div>
          </div>
          <StatusIndicatorPill {...status} />
        </div>
        <BentoLayout maxColumns={2} bentoOffMedium={false}>
          {measurements.map((m, i) => (
            <Measurement key={`${m.measurement}-${i}`} {...m} />
          ))}
        </BentoLayout>
      </div>
    </div>
  );
}
