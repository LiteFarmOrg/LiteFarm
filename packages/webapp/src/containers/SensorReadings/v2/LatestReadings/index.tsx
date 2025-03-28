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
import { useTranslation } from 'react-i18next';
import { GrUpdate } from 'react-icons/gr';
import TextButton from '../../../../components/Form/Button/TextButton';
import BentoLayout from '../../../../components/Layout/BentoLayout';
import SensorKPI, { SensorKPIprops } from '../../../../components/Tile/SensorTile/SensorKPI';
import SensorReadingKPI, {
  SensorReadingKPIprops,
} from '../../../../components/Tile/SensorTile/SensorReadingKPI';
import { LineConfig } from '../../../../components/Charts/LineChart';
import { measurementSelector } from '../../../userFarmSlice';
import useLatestReadings from './useLatestReadings';
import { timeDifference } from '../../utils';
import { formatReadingsToSensorKPIProps, formatReadingsToSensorReadingKPIProps } from './utils';
import { Sensor } from '../../../../store/api/types';
import styles from '../styles.module.scss';

type SensorArrayProps = {
  isSensorArray: true;
  sensorColorMap: LineConfig[];
};

type StandaloneSensorProps = {
  isSensorArray: false;
};

type LatestReadingsProps = { sensors: Sensor[] } & (SensorArrayProps | StandaloneSensorProps);

function LatestReadings(props: LatestReadingsProps) {
  const { sensors, isSensorArray } = props;

  const { t } = useTranslation();
  const system = useSelector(measurementSelector);

  const { isLoading, latestReadings, latestReadingTime, update } = useLatestReadings(sensors);

  const lastSeenString = latestReadingTime
    ? timeDifference(new Date(), new Date(latestReadingTime))
    : '-';

  const kpiPropsArray = isSensorArray
    ? formatReadingsToSensorKPIProps(sensors, latestReadings, system, t, props.sensorColorMap)
    : formatReadingsToSensorReadingKPIProps(sensors[0], latestReadings, system, t);

  return (
    <>
      <div className={styles.contentTop}>
        <dl>
          <dt>{t('SENSOR.READING.LATEST_READING')}</dt>
          <dd>{lastSeenString}</dd>
        </dl>
        <TextButton onClick={update} className={styles.updateButton}>
          <GrUpdate />
          {t('SENSOR.READING.UPDATE_READINGS')}
        </TextButton>
      </div>
      <div className={styles.kpi}>
        {isSensorArray && (
          <BentoLayout>
            {(kpiPropsArray as SensorKPIprops[]).map((kpiProps) => (
              <SensorKPI key={kpiProps.sensor.id} {...kpiProps} />
            ))}
          </BentoLayout>
        )}
        {!isSensorArray && (
          <BentoLayout>
            {(kpiPropsArray as SensorReadingKPIprops[]).map((kpiProps) => (
              <SensorReadingKPI key={kpiProps.measurement} {...kpiProps} />
            ))}
          </BentoLayout>
        )}
      </div>
    </>
  );
}

export default LatestReadings;
