import React, { useState } from 'react';
import styles from './styles.module.scss';
import { AddLink } from '../../Typography';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { locationsSelector } from '../../../containers/locationSlice';
import LocationCreationModal from '../../LocationCreationModal';

export default function TaskCount({ count, handleAddTask, isAdmin }) {
  const { t } = useTranslation();
  const locations = useSelector(locationsSelector);
  const [createLocation, setCreateLocation] = useState(false);

  const dismissLocationCreationModal = () => {
    setCreateLocation(false);
  };

  const handleClick = () => {
    if (locations.length) {
      handleAddTask();
    } else {
      setCreateLocation(true);
    }
  };

  return (
    <div className={styles.taskCountContainer}>
      <div data-cy="tasks-taskCount" className={styles.taskCount}>
        {t('TASK.TASKS_COUNT', { count })}
      </div>
      <AddLink onClick={handleClick}>{t('TASK.ADD_TASK')}</AddLink>
      {createLocation && (
        <LocationCreationModal
          title={t('LOCATION_CREATION.TASK_TITLE')}
          body={
            isAdmin ? t('LOCATION_CREATION.TASK_BODY') : t('LOCATION_CREATION.TASK_BODY_WORKER')
          }
          dismissModal={dismissLocationCreationModal}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
