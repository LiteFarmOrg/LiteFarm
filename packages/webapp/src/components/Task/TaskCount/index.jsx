import React from 'react';
import styles from './styles.module.scss';
import { AddLink } from '../../Typography';
import { useTranslation } from 'react-i18next';

export default function TaskCount({ count, handleAddTask }) {
  const { t } = useTranslation();
  return (
    <div className={styles.taskCountContainer}>
      <div className={styles.taskCount}>{t('TASK.TASKS_COUNT', { count })}</div>
      <AddLink onClick={handleAddTask}>{t('TASK.ADD_TASK')}</AddLink>
    </div>
  );
}
