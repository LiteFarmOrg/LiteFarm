import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';

export default function TaskCount({ count }) {
  const { t } = useTranslation();

  return (
    <div className={styles.taskCountContainer}>
      <div data-cy="tasks-taskCount" className={styles.taskCount}>
        {t('TASK.TASKS_COUNT', { count })}
      </div>
    </div>
  );
}
