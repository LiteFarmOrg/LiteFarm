import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import { AddLink, Semibold, Text } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { cropsSelector } from '../cropSlice';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './styles.module.scss';

import { isAdminSelector } from '../userFarmSlice';
import { resetAndUnLockFormData } from '../hooks/useHookFormPersist/hookFormPersistSlice';
// import ActiveFilterBox from '../../components/ActiveFilterBox';
import { taskReducerSelector, taskEntitiesSelector } from '../taskSlice';
import { getTasks } from './saga';
import TaskCard from './TaskCard';
import StateTab from '../../components/RouterTab/StateTab';
import { ALL, TODO, UNASSIGNED } from './constants';

export default function TaskPage({ history }) {
  const { t } = useTranslation();
  const isAdmin = useSelector(isAdminSelector);
  const tasks = useSelector(taskEntitiesSelector);
  console.log({ tasks });
  const dispatch = useDispatch();

  const defaultTab = TODO;
  const [activeTab, setTab] = useState(defaultTab);

  useEffect(() => {
    dispatch(getTasks());
  }, []);

  useEffect(() => {
    dispatch(resetAndUnLockFormData());
  }, []);

  const tasksToDisplay = useMemo(() => {
    switch (activeTab) {
      case ALL:
        return tasks;
      case TODO:
        return tasks.filter((task) => !task.completed_time && !task.abandoned_time);
      case UNASSIGNED:
        return tasks.filter((task) => !task.assignee_user_id);
      default:
        return [];
    }
  }, [tasks, activeTab]);

  console.log({ tasksToDisplay });

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
          {t('TASK.TASKS_COUNT', { count: tasksToDisplay.length })}
        </div>
        {isAdmin && (
          <AddLink onClick={() => history.push('/tasks/new')}>{t('TASK.ADD_TASK')}</AddLink>
        )}
      </div>
      {tasksToDisplay.map((task) => (
        <TaskCard task={task} key={task.task_id} style={{ marginBottom: '14px' }} />
      ))}
    </Layout>
  );
}
