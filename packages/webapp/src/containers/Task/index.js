import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import { AddLink, Semibold } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './styles.module.scss';

import { isAdminSelector, loginSelector } from '../userFarmSlice';
import { resetAndUnLockFormData } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import StateTab from '../../components/RouterTab/StateTab';
import { ALL, TODO, UNASSIGNED } from './constants';
import { getManagementPlansAndTasks } from '../saga';
import { taskCardContentSelector } from './taskCardContentSelector';
import TaskCard from './TaskCard';
import { onAddTask } from './onAddTask';

export default function TaskPage({ history }) {
  const { t } = useTranslation();
  const isAdmin = useSelector(isAdminSelector);
  const { user_id, farm_id } = useSelector(loginSelector);
  const tasks = useSelector(taskCardContentSelector);
  const dispatch = useDispatch();

  const defaultTab = TODO;
  const [activeTab, setTab] = useState(defaultTab);

  useEffect(() => {
    dispatch(getManagementPlansAndTasks());
  }, []);

  useEffect(() => {
    dispatch(resetAndUnLockFormData());
  }, []);

  const taskCardContents = useMemo(() => {
    switch (activeTab) {
      case ALL:
        return tasks;
      case TODO:
        return tasks.filter(
          (task) => task.assignee?.user_id === user_id && ['planned', 'late'].includes(task.status),
        );
      case UNASSIGNED:
        return tasks.filter((task) => !task.assignee);
      default:
        return [];
    }
  }, [tasks, activeTab]);

  return (
    <Layout classes={{ container: { backgroundColor: 'white' } }}>
      <PageTitle title={t('TASK.PAGE_TITLE')} style={{ paddingBottom: '20px' }} />
      <StateTab
        classes={{ container: { marginBottom: '20px' } }}
        tabs={[
          {
            label: t('TASK.TODO'),
            key: TODO,
          },
          {
            label: t('TASK.UNASSIGNED'),
            key: UNASSIGNED,
          },
          {
            label: t('TASK.ALL'),
            key: ALL,
          },
        ]}
        state={activeTab}
        setState={setTab}
      />
      <div className={styles.taskCountContainer}>
        <div className={styles.taskCount}>
          {t('TASK.TASKS_COUNT', { count: taskCardContents.length })}
        </div>
        <AddLink onClick={onAddTask(dispatch, history, `/tasks`)}>{t('TASK.ADD_TASK')}</AddLink>
      </div>
      {taskCardContents.length > 0 ? (
        taskCardContents.map((task) => (
          <TaskCard
            key={task.task_id}
            onClick={() => history.push(`/tasks/${task.task_id}/read_only`)}
            style={{ marginBottom: '14px' }}
            {...task}
          />
        ))
      ) : (
        <Semibold style={{ color: 'var(--teal700)' }}>{t('TASK.NO_TASKS_TO_DISPLAY')}</Semibold>
      )}
    </Layout>
  );
}
