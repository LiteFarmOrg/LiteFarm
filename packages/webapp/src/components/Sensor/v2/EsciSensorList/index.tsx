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

import { Fragment } from 'react';
import clsx from 'clsx';
import { TFunction, useTranslation } from 'react-i18next';
import { VscLocation } from 'react-icons/vsc';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import { Main } from '../../../Typography';
import TextButton from '../../../Form/Button/TextButton';
import MainContent, { IconType } from '../../../Expandable/MainContent';
import ExpandableItem from '../../../Expandable/ExpandableItem';
import useExpandable from '../../../Expandable/useExpandableItem';
import type {
  SensorSummary,
  GroupedSensors,
} from '../../../../containers/SensorList/useGroupedSensors';
import SensorTable, { SensorTableVariant } from '../SensorTable';
import OverviewStats, { OverviewStatsProps } from '../../../OverviewStats';
import { ReactComponent as SensorIcon } from '../../../../assets/images/map/signal-01.svg';
import { ReactComponent as SensorArrayIcon } from '../../../../assets/images/farmMapFilter/SensorArray.svg';
import { SENSOR_ARRAY } from '../../../../containers/SensorReadings/constants';
import { Location } from '../../../../types';
import { Sensor } from '../../../../store/api/types';
import styles from './styles.module.scss';

const kpiTranslationMappings: {
  key: Sensor['name'] | typeof SENSOR_ARRAY;
  translationKey: string;
}[] = [
  { key: SENSOR_ARRAY, translationKey: 'SENSOR.SENSOR_ARRAYS' },
  { key: 'Soil Water Potential Sensor', translationKey: 'SENSOR.READING.SOIL_WATER_POTENTIAL' },
  { key: 'IR Temperature Sensor', translationKey: 'SENSOR.CANOPY_TEMPERATURE' },
];
// t('SENSOR.SENSOR_ARRAYS')
// t('SENSOR.READING.SOIL_WATER_POTENTIAL')
// t('SENSOR.CANOPY_TEMPERATURE')

const formatKpiLabel: OverviewStatsProps['format'] = (statsKey, label) => {
  const Icon = statsKey === SENSOR_ARRAY ? SensorArrayIcon : SensorIcon;
  return (
    <div className={styles.kpiLabel}>
      <span className={styles.iconWrapper}>
        <Icon />
      </span>
      <span className={styles.text}>{label}</span>
    </div>
  );
};

const DetectedFields = ({ fields = [], t }: { fields: Location['name'][]; t: TFunction }) => {
  if (!fields.length) {
    return null;
  }

  return (
    <div>
      <Main className={styles.fieldListLead}>{t('SENSOR.DETAIL.DETECTED_FIELD')}</Main>
      <ul className={styles.fieldList}>
        {fields.map((field) => {
          return <li key={field}>{field}</li>;
        })}
      </ul>
    </div>
  );
};

const SensorIconWithNumber = ({ number }: { number: number }) => {
  return (
    <div className={styles.sensorIconWithNumber}>
      <SensorIcon />
      <div className={styles.number}>{number}</div>
    </div>
  );
};

type EsciSensorListProps = {
  groupedSensors: GroupedSensors[];
  summary: SensorSummary;
};

const EsciSensorList = ({ groupedSensors, summary }: EsciSensorListProps) => {
  const { t } = useTranslation();
  const { expandedIds, toggleExpanded } = useExpandable({ isSingleExpandable: true });
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <div className={styles.wrapper}>
      <Main className={styles.title}>
        {t('SENSOR.PARTNER_SENSOR_LIST', { partner: 'Ensemble' })}
      </Main>
      <OverviewStats
        stats={summary}
        translationMappings={kpiTranslationMappings}
        format={formatKpiLabel}
        isCompact={isCompact}
      />
      <div className={styles.sensorGroups}>
        {groupedSensors.map(({ id, isSensorArray, sensors, fields }) => {
          const isExpanded = expandedIds.includes(id);

          return (
            <Fragment key={id}>
              <ExpandableItem
                itemKey={id}
                classes={{
                  container: clsx(styles.expandableContainer, isExpanded ? styles.active : ''),
                  mainContentWithIcon: styles.expandableHeader,
                }}
                isExpanded={isExpanded}
                iconClickOnly={false}
                onClick={() => toggleExpanded(id)}
                leftCollapseIcon
                mainContent={
                  <MainContent isExpanded={isExpanded} errorCount={0} iconType={IconType.SIMPLE}>
                    <div className={styles.mainContent}>
                      <SensorIconWithNumber number={sensors.length} />
                      <span>
                        {isSensorArray ? t('SENSOR.SENSOR_ARRAY') : t('SENSOR.STANDALONE_SENSOR')}
                      </span>
                    </div>
                  </MainContent>
                }
                expandedContent={
                  <div className={styles.expandedContent}>
                    <SensorTable
                      data={sensors}
                      variant={SensorTableVariant.SIMPLE}
                      isCompact={isCompact}
                    />
                    <DetectedFields t={t} fields={fields} />
                    <TextButton
                      className={styles.seeOnMapButton}
                      onClick={() => console.log('TODO: LF-4697')}
                    >
                      <VscLocation size={24} className={styles.mapPinIcon} />
                      {t('common:SEE_ON_MAP')}
                    </TextButton>
                  </div>
                }
              />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default EsciSensorList;
