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
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { IconLink, Main } from '../../../../Typography';
import SensorForm from './SensorForm';
import { System } from '../../../../../types';
import {
  ArrayFields,
  ARRAYS,
  FormFields,
  SensorFields,
} from '../../../../../containers/LocationDetails/PointDetails/SensorDetail/V2/types';
import useExpandable from '../../../../Expandable/useExpandableItem';
import ExpandableItem from '../../../../Expandable/ExpandableItem';
import { ReactComponent as TrashIcon } from '../../../../../assets/images/animals/trash_icon_new.svg';
import { ReactComponent as CheckIcon } from '../../../../../assets/images/check-circle.svg';
import { ReactComponent as WarningIcon } from '../../../../../assets/images/warning.svg';
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

export interface SensorsFormProps {
  system: System;
}

const SensorsForm = ({ system }: SensorsFormProps) => {
  const { expandedIds, toggleExpanded } = useExpandable(
    // @ts-ignore
    { isSingleExpandable: true },
  );

  const { t } = useTranslation();

  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { isValid, errors },
  } = useFormContext<FormFields>();

  const { update } = useFieldArray({
    control,
    name: ARRAYS,
  });

  const arrays = watch(ARRAYS);

  useEffect(() => {
    arrays.forEach((array, index: number) => {
      if (array.sensor_count !== array.sensors.length) {
        const newSensors = array.sensors.slice();

        if (array.sensor_count < array.sensors.length) {
          newSensors.length = array.sensor_count;
        }

        if (array.sensor_count > array.sensors.length) {
          const diff = array.sensor_count - array.sensors.length;
          for (let i = 0; i < diff; i++) {
            newSensors.push({ ...sensorDefaultValues, id: uuidv4() });
          }
        }

        setValue(`${ARRAYS}.${index}.${ArrayFields.SENSORS}`, newSensors);
      }
    });
  }, []);
  console.log(errors, isValid);
  return (
    <div className={styles.formsWrapper}>
      <Main className={styles.formsTitle}>{t('SENSOR.DETAIL.SENSOR_DETAILS')}</Main>

      {arrays.map((array, index) => {
        return (
          <div className={styles.arraySensors} key={index}>
            <Main className={styles.arraySensorsArrayName}>
              {array.array_name || t('SENSOR.DETAIL.ARRAY_NUMBER', { number: index + 1 })}
            </Main>
            {array.sensors.map((sensor, sensorIndex) => {
              const namePrefix = `${ARRAYS}.${index}.${ArrayFields.SENSORS}[${sensorIndex}].`;
              const onRemove = () => {
                const newSensors = array.sensors.slice();
                newSensors.splice(sensorIndex, 1);
                update(index, { ...array, sensors: newSensors });
                setValue(`${ARRAYS}.${index}.${ArrayFields.SENSOR_COUNT}`, newSensors.length);
              };
              const key = `${index}-${sensor.id}`;
              const isExpanded = expandedIds.includes(key);
              const sensorErrors =
                errors?.[ARRAYS]?.[index]?.[ArrayFields.SENSORS]?.[sensorIndex] || {};
              const errorCount = Object.keys(sensorErrors).length;
              const onClick = () => {
                trigger(`${ARRAYS}.${index}.${ArrayFields.SENSORS}`);
                toggleExpanded(key);
              };

              return (
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
                      isRemovable={array.sensors.length > 1}
                      errorCount={errorCount}
                    >
                      <Main>{t('SENSOR.DETAIL.SENSOR_NUMBER', { number: sensorIndex + 1 })}</Main>
                    </MainContent>
                  }
                  expandedContent={
                    <div className={styles.sensorFormWrapper}>
                      <SensorForm key={key} namePrefix={namePrefix} system={system} />
                    </div>
                  }
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default SensorsForm;

const MainContent = ({ isExpanded, isRemovable, onRemove, errorCount, children }) => {
  const { t } = useTranslation();

  const renderStatusOrAction = () => {
    if (isExpanded) {
      return isRemovable ? (
        <IconLink
          className={styles.removeLink}
          onClick={onRemove}
          icon={<TrashIcon />}
          isIconClickable
          underlined={false}
        >
          {t('common:REMOVE')}
        </IconLink>
      ) : null;
    }

    return errorCount ? (
      <div className={styles.errorCount}>
        <WarningIcon />
        {errorCount}
      </div>
    ) : (
      <CheckIcon className={styles.check} />
    );
  };

  return (
    <div className={styles.mainContent}>
      {children}
      {renderStatusOrAction()}
    </div>
  );
};
