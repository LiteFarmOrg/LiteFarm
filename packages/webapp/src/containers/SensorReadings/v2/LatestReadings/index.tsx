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

import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { GrUpdate } from 'react-icons/gr';
import TextButton from '../../../../components/Form/Button/TextButton';
import BentoLayout from '../../../../components/Layout/BentoLayout';
import SensorKPI, { SensorKPIprops } from '../../../../components/Tile/SensorTile/SensorKPI';
import SensorReadingKPI, {
  SensorReadingKPIprops,
} from '../../../../components/Tile/SensorTile/SensorReadingKPI';
import DescriptionListTile, {
  type TileData,
} from '../../../../components/Tile/DescriptionListTile';
import { LineConfig } from '../../../../components/Charts/LineChart';
import { OverlaySpinner } from '../../../../components/Spinner';
import { measurementSelector } from '../../../userFarmSlice';
import useLatestReadings from './useLatestReadings';
import { timeDifference } from '../../../../util/timeDifference';
import { formatArrayReadingsToKPIProps, formatStandaloneSensorReadingsToKPIProps } from './utils';
import { Sensor } from '../../../../store/api/types';
import { SensorType } from '../../../../types/sensor';
import styles from '../styles.module.scss';

export type SensorArrayProps = {
  type: SensorType.SENSOR_ARRAY;
  sensorColorMap: LineConfig[];
};

export type StandaloneSensorProps = {
  type: SensorType.SENSOR;
};

export type LatestReadingsProps = { sensors: Sensor[] } & (
  | SensorArrayProps
  | StandaloneSensorProps
);

function isWeatherKPIData(
  kpiData: TileData[] | SensorKPIprops[] | SensorReadingKPIprops[],
): kpiData is TileData[] {
  return 'label' in kpiData[0];
}

const LatestReadings = (props: LatestReadingsProps) => {
  const { sensors, type } = props;

  const { t } = useTranslation();
  const system = useSelector(measurementSelector);

  const { isFetching, latestReadings, latestReadingTime, update } = useLatestReadings(sensors);

  const latestReadingTimeString = latestReadingTime
    ? timeDifference(new Date(), new Date(latestReadingTime))
    : '-';

  const kpiData =
    type === SensorType.SENSOR_ARRAY
      ? formatArrayReadingsToKPIProps(sensors, latestReadings, system, props.sensorColorMap, t)
      : formatStandaloneSensorReadingsToKPIProps(sensors[0], latestReadings, system, t);

  return (
    <>
      <div className={styles.contentTop}>
        <dl>
          <dt>{t('SENSOR.READING.LATEST_READING')}</dt>
          <dd>{latestReadingTimeString}</dd>
        </dl>
        <TextButton onClick={update} className={styles.updateButton}>
          <GrUpdate />
          {t('SENSOR.READING.UPDATE_READINGS')}
        </TextButton>
      </div>
      <div className={clsx(styles.kpi, styles[type])}>
        {isFetching && <OverlaySpinner />}
        {isWeatherKPIData(kpiData) ? (
          <dl className={styles.weatherKPI}>
            {kpiData.map((kpiProps) => (
              <DescriptionListTile key={kpiProps.label} {...kpiProps} />
            ))}
          </dl>
        ) : (
          <BentoLayout>
            {kpiData.map((kpiProps) => {
              return 'sensor' in kpiProps ? ( // Check if kpiProps is of type SensorKPIprops (type: SensorType.SENSOR_ARRAY)
                <SensorKPI key={kpiProps.sensor.id} {...kpiProps} />
              ) : (
                <SensorReadingKPI key={kpiProps.measurement} {...kpiProps} />
              );
            })}
          </BentoLayout>
        )}
      </div>
    </>
  );
};

export default LatestReadings;
