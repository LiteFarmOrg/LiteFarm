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
import { Fragment, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Main } from '../../../../Typography';
import SensorForm from './SensorForm';
import { System } from '../../../../../types';
import {
  ARRAYS,
  ArrayFields,
  SensorFields,
  type FormFields,
} from '../../../../../containers/LocationDetails/PointDetails/SensorDetail/V2/types';
import useExpandable from '../../../../Expandable/useExpandableItem';
import ExpandableItem from '../../../../Expandable/ExpandableItem';
import MainContent from '../../../../Expandable/MainContent';
import styles from '../styles.module.scss';

// TODO: Finalize the default values
export const sensorDefaultValues = {
  [SensorFields.NAME]: '',
  [SensorFields.TYPES]: [],
  [SensorFields.PLACEMENT]: '',
  [SensorFields.DEPTH]: 0,
  [SensorFields.DEPTH_UNIT]: '',
  [SensorFields.MANUFUCTURER]: '',
  [SensorFields.SENSOR_ID]: '',
};

export interface ArraySensorsFormProps {
  arrayName?: string;
  sensorCount: number;
  arrayIndex: number;
  system: System;
}

const ArraySensorsForm = ({
  arrayName,
  sensorCount,
  arrayIndex,
  system,
}: ArraySensorsFormProps) => {
  const { t } = useTranslation();

  const {
    control,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<FormFields>();

  const {
    fields: sensors,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `${ARRAYS}.${arrayIndex}.${ArrayFields.SENSORS}`,
  });

  const { expandedIds, toggleExpanded } = useExpandable(
    // @ts-ignore
    { isSingleExpandable: false, defaultExpandedIds: [`${arrayIndex}-${sensors[0].id}`] },
  );

  useEffect(() => {
    if (sensorCount !== sensors.length) {
      const newSensors = sensors.slice();

      if (sensorCount < sensors.length) {
        newSensors.length = sensorCount;
        setValue(`${ARRAYS}.${arrayIndex}.${ArrayFields.SENSORS}`, newSensors);
      }

      if (sensorCount > sensors.length) {
        const diff = sensorCount - sensors.length;
        for (let i = 0; i < diff; i++) {
          append(sensorDefaultValues);
        }
      }
    }
  }, []);

  return (
    <div className={styles.arraySensors}>
      <Main className={styles.arraySensorsArrayName}>
        {arrayName || t('SENSOR.DETAIL.ARRAY_NUMBER', { number: arrayIndex + 1 })}
      </Main>
      {sensors.map((sensor, sensorIndex) => {
        const namePrefix = `${ARRAYS}.${arrayIndex}.${ArrayFields.SENSORS}[${sensorIndex}].`;
        const key = `${arrayIndex}-${sensor.id}`;

        const onRemove = () => {
          remove(sensorIndex);
          setValue(`${ARRAYS}.${arrayIndex}.${ArrayFields.SENSOR_COUNT}`, sensors.length - 1);
        };

        const onClick = () => {
          if (isExpanded) {
            trigger(`${ARRAYS}.${arrayIndex}.${ArrayFields.SENSORS}.${sensorIndex}`);
          }

          toggleExpanded(key);
        };

        const isExpanded = expandedIds.includes(key);
        const sensorErrors =
          errors?.[ARRAYS]?.[arrayIndex]?.[ArrayFields.SENSORS]?.[sensorIndex] || {};
        const errorCount = Object.keys(sensorErrors).length;

        return (
          // Use Fragment to avoid "ExpandableItem: `key` is not a prop" issue
          <Fragment key={key}>
            <ExpandableItem
              itemKey={key}
              classes={{
                container: styles.expandableContainer,
                expandedContainer: styles.expandedContainer,
                mainContentWithIcon: styles.expandableHeader,
              }}
              isExpanded={isExpanded}
              iconClickOnly={false}
              onClick={onClick}
              leftCollapseIcon
              mainContent={
                <MainContent
                  isExpanded={isExpanded}
                  onRemove={onRemove}
                  isRemovable={sensors.length > 1}
                  errorCount={errorCount}
                >
                  <Main>{t('SENSOR.DETAIL.SENSOR_NUMBER', { number: sensorIndex + 1 })}</Main>
                </MainContent>
              }
              expandedContent={
                <div className={styles.sensorFormWrapper}>
                  <SensorForm namePrefix={namePrefix} system={system} />
                </div>
              }
            />
          </Fragment>
        );
      })}
    </div>
  );
};

export default ArraySensorsForm;
