import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import { AddLink, Semibold } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './styles.module.scss';

import { isAdminSelector, loginSelector } from '../userFarmSlice';
import {
  resetAndUnLockFormData,
  setPersistedPaths,
} from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { tasksSelector } from '../taskSlice';
import { getProducts, getTasks } from './saga';
import TaskCard from './TaskCard';
import StateTab from '../../components/RouterTab/StateTab';
import { ALL, TODO, UNASSIGNED } from './constants';
import TaskQuickAssignModal from '../../components/Task/QuickAssign';
import { getManagementPlans } from '../saga';

export default function TaskPage({ history }) {
  const { t } = useTranslation();
  const isAdmin = useSelector(isAdminSelector);
  const { user_id } = useSelector(loginSelector);
  const tasks = useSelector(tasksSelector);
  const dispatch = useDispatch();

  const defaultTab = TODO;
  const [activeTab, setTab] = useState(defaultTab);
  const [quickAssignInfo, setQuickAssignInfo] = useState(null);

  const handleClickAssignee = (taskId, dueDate, isAssigned) => {
    setQuickAssignInfo({ taskId, dueDate, isAssigned });
  };

  useEffect(() => {
    dispatch(getTasks());
    dispatch(getProducts());
    dispatch(getManagementPlans());
  }, []);

  useEffect(() => {
    dispatch(resetAndUnLockFormData());
  }, []);

  const tasksToDisplay = useMemo(() => {
    switch (activeTab) {
      case ALL:
        return tasks;
      case TODO:
        return tasks.filter(
          (task) =>
            task.assignee_user_id === user_id && !task.abandoned_time && !task.completed_time,
        );
      case UNASSIGNED:
        return tasks.filter((task) => !task.assignee_user_id);
      default:
        return [];
    }
  }, [tasks, activeTab]);

  const onAddTask = () => {
    //TODO: remove all persistedPath in add task flow
    dispatch(
      setPersistedPaths([
        '/add_task/task_type_selection',
        '/add_task/task_assignment',
        '/add_task/task_crops',
        '/add_task/manage_custom_tasks',
        '/add_task/add_custom_task',
        '/add_task/edit_custom_task',
        '/add_task/edit_custom_task_update',
        '/add_task/task_details',
        '/add_task/task_locations',
        '/add_task/task_date',
        '/add_task/planting_method',
        '/add_task/container_method',
        '/add_task/bed_method',
        '/add_task/bed_guidance',
        '/add_task/row_method',
        '/add_task/row_guidance',
      ]),
    );
    history.push('/add_task/task_type_selection');
  };

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
        <AddLink onClick={onAddTask}>{t('TASK.ADD_TASK')}</AddLink>
      </div>
      {tasksToDisplay.length > 0 ? (
        tasksToDisplay.map((task) => (
          <TaskCard
            task={task}
            key={task.task_id}
            onClickAssignee={handleClickAssignee}
            onClick={() => history.push(`/tasks/${task.task_id}/read_only`)}
            style={{ marginBottom: '14px' }}
          />
        ))
      ) : (
        <Semibold style={{ color: 'var(--teal700)' }}>{t('TASK.NO_TASKS_TO_DISPLAY')}</Semibold>
      )}
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
