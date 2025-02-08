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
import { type GroupedSensors } from '../../../../containers/Sensor/useGroupedSensors';
import SensorTable, { SensorTableVariant } from '../SensorTable';
import { ReactComponent as SensorIcon } from '../../../../assets/images/devices/signal-01.svg';
import { Location } from '../../../../types';
import styles from './styles.module.scss';

const DetectedFields = ({ fields = [], t }: { fields: Location['name'][]; t: TFunction }) => {
  if (!fields.length) {
    return null;
  }

  return (
    <div>
      <Main className={styles.fieldListLead}>{t('SENSOR.DETAIL.DITECTED_FIELD')}</Main>
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

const EsciSensors = ({ groupedSensors }: { groupedSensors: GroupedSensors[] }) => {
  const { t } = useTranslation();
  const { expandedIds, toggleExpanded } = useExpandable({ isSingleExpandable: true });
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <div className={styles.wrapper}>
      <Main className={styles.title}>
        {t('SENSOR.PARTNER_SENSOR_LIST', { partner: 'Ensemble' })}
      </Main>
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

export default EsciSensors;
