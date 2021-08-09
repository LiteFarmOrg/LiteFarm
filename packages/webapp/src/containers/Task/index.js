import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import { AddLink } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './styles.module.scss';

import { isAdminSelector } from '../userFarmSlice';
import { resetAndUnLockFormData } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { taskEntitiesSelector } from '../taskSlice';
import { getTasks } from './saga';
import TaskCard from './TaskCard';
import StateTab from '../../components/RouterTab/StateTab';
import { ALL, TODO, UNASSIGNED } from './constants';
import TaskQuickAssignModal from '../../components/Task/QuickAssign';

export default function TaskPage({ history }) {
  const { t } = useTranslation();
  const isAdmin = useSelector(isAdminSelector);
  const tasks = useSelector(taskEntitiesSelector);
  const dispatch = useDispatch();

  const defaultTab = TODO;
  const [activeTab, setTab] = useState(defaultTab);
  const [quickAssignInfo, setQuickAssignInfo] = useState(null);

  const handleClickAssignee = (taskId, dueDate, isAssigned) => {
    setQuickAssignInfo({ taskId, dueDate, isAssigned });
  };

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
        <AddLink onClick={() => history.push('/tasks/new')}>{t('TASK.ADD_TASK')}</AddLink>
      </div>
      {tasksToDisplay.map((task) => (
        <TaskCard
          task={task}
          key={task.task_id}
          onClickAssignee={handleClickAssignee}
          style={{ marginBottom: '14px' }}
        />
      ))}
      {quickAssignInfo && (
        <TaskQuickAssignModal
          dismissModal={() => setQuickAssignInfo(null)}
          taskId={quickAssignInfo.taskId}
          dueDate={quickAssignInfo.dueDate}
          isAssigned={quickAssignInfo.isAssigned}
        />
      )}
    </Layout>
  );
}
