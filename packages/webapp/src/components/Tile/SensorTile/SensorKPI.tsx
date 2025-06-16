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

import { useTranslation } from 'react-i18next';
import Icon, { IconName } from '../../Icons';
import BentoLayout from '../../Layout/BentoLayout';
import { StatusIndicatorPill, StatusIndicatorPillProps } from '../../StatusIndicatorPill';
import styles from './styles.module.scss';
import { TMeasurement } from './SensorReadingKPI';
import { roundToOne } from '../../../util/rounding';

export interface SensorKPIprops extends React.HTMLAttributes<HTMLDivElement> {
  sensor: {
    id: string | number;
    status: StatusIndicatorPillProps;
  };
  discriminator: TMeasurement;
  measurements: TMeasurement[];
  color?: string;
}

export interface MeasurementProps extends TMeasurement, React.HTMLAttributes<HTMLDivElement> {}

const discriminatorIconName: { [key: string]: IconName } = {
  depth_elevation: 'RULER',
};

const Measurement = ({ measurement, value, unit, ...rest }: MeasurementProps) => (
  <div {...rest} className={styles.measurement}>
    <div className={styles.measureText}>{measurement}</div>
    <div className={styles.valueText}>
      {value}
      {unit}
    </div>
  </div>
);

/**
 * A component that displays a sensor KPI.
 * AI-assisted JsDoc
 *
 * @component
 * @param props - The props for the component.
 * @param props.sensor - The sensor details data.
 * @param props.discriminator - The primary differntiator between sensors in a profile.
 * @param props.measurements - An array of measurements for each sensor parameter.
 * @param props.color - The primary color for styling - should be a six digit hex color.
 * @param props.rest - Additional props to spread onto the root div.
 * @returns The rendered SensorKPI component.
 */
export default function SensorKPI({
  sensor,
  discriminator,
  measurements,
  color = '#000000',
  ...rest
}: SensorKPIprops) {
  const { measurement, value, unit } = discriminator;
  const { status, id } = sensor;
  const { t } = useTranslation();

  // 0D is the code for 5% opacity, 95% transparency
  const style = {
    '--color': color,
    '--colorWithOpacity': `${color}0D`,
  } as React.CSSProperties;
  return (
    <div {...rest} className={styles.sensorKpi} style={style}>
      <div className={styles.topDetails}>
        <div className={styles.sensor}>
          <Icon iconName="SENSOR" className={styles.icon} />
          {id}
        </div>
        <div className={styles.discriminator}>
          <Icon iconName={discriminatorIconName[measurement] || 'RULER'} className={styles.icon} />
          <div className={styles.discriminatorText}>
            {roundToOne(value)}
            {unit}
          </div>
        </div>
        <StatusIndicatorPill {...status} />
      </div>
      <BentoLayout maxColumns={2} bentoOffMedium={false}>
        {measurements.length
          ? measurements.map((m, i) => <Measurement key={`${m.measurement}-${i}`} {...m} />)
          : t('SENSOR.NO_RECENT_SENSOR_READINGS')}
      </BentoLayout>
    </div>
  );
}
