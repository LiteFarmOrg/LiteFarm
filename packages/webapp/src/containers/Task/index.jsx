import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import { AddLink, Semibold } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './styles.module.scss';

import { isAdminSelector, userFarmSelector } from '../userFarmSlice';
import { resetAndUnLockFormData } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { getManagementPlansAndTasks } from '../saga';
import TaskCard from './TaskCard';
import { onAddTask } from './onAddTask';
import MuiFullPagePopup from '../../components/MuiFullPagePopup/v2';
import TasksFilterPage from '../Filter/Tasks';
import {
  isFilterCurrentlyActiveSelector,
  setTasksFilter,
  tasksFilterSelector,
} from '../filterSlice';
import ActiveFilterBox from '../../components/ActiveFilterBox';
import PureTaskDropdownFilter from '../../components/PopupFilter/PureTaskDropdownFilter';
import produce from 'immer';
import { IS_ASCENDING } from '../Filter/constants';
import { filteredTaskCardContentSelector } from './taskCardContentSelector';

export default function TaskPage({ history }) {
  const { t } = useTranslation();
  const isAdmin = useSelector(isAdminSelector);
  const { user_id, farm_id, first_name, last_name } = useSelector(userFarmSelector);
  const taskCardContents = useSelector(filteredTaskCardContentSelector);
  const dispatch = useDispatch();

  const tasksFilter = useSelector(tasksFilterSelector);
  const isFilterCurrentlyActive = useSelector(isFilterCurrentlyActiveSelector('tasks'));

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const onFilterClose = () => {
    setIsFilterOpen(false);
  };
  const onFilterOpen = () => {
    setIsFilterOpen(true);
  };

  useEffect(() => {
    dispatch(getManagementPlansAndTasks());
  }, []);

  useEffect(() => {
    dispatch(resetAndUnLockFormData());
  }, []);

  const assigneeValue = useMemo(() => {
    let unassigned;
    let myTask;
    for (const [assignee, { active }] of Object.entries(tasksFilter.ASSIGNEE)) {
      if (assignee === 'unassigned' && active) {
        unassigned = true;
      } else if (assignee === user_id && active) {
        myTask = true;
      } else if (active) {
        return undefined;
      }
    }
    if (unassigned && !myTask) return 'unassigned';
    if (myTask) return 'myTask';
    return 'all';
  }, [tasksFilter.ASSIGNEE]);
  const onAssigneeChange = (e) => {
    const assigneeValue = e.target.value;
    dispatch(
      setTasksFilter(
        produce(tasksFilter, (tasksFilter) => {
          for (const assignee in tasksFilter.ASSIGNEE) {
            tasksFilter.ASSIGNEE[assignee].active = false;
          }
          if (assigneeValue === 'myTask') {
            tasksFilter.ASSIGNEE[user_id] = { active: true, label: `${first_name} ${last_name}` };
          } else if (assigneeValue === 'unassigned') {
            tasksFilter.ASSIGNEE.unassigned = { active: true, label: t('TASK.UNASSIGNED') };
          }
        }),
      ),
    );
  };
  const onDateOrderChange = (e) => {
    const dateOrderValue = e.target.value;
    dispatch(
      setTasksFilter(
        produce(tasksFilter, (tasksFilter) => {
          tasksFilter[IS_ASCENDING] = dateOrderValue === 'ascending';
        }),
      ),
    );
  };
  return (
    <Layout classes={{ container: { backgroundColor: 'white' } }}>
      <PageTitle title={t('TASK.PAGE_TITLE')} style={{ paddingBottom: '20px' }} />
      <PureTaskDropdownFilter
        onDateOrderChange={onDateOrderChange}
        isAscending={tasksFilter[IS_ASCENDING]}
        onAssigneeChange={onAssigneeChange}
        assigneeValue={assigneeValue}
        onFilterOpen={onFilterOpen}
        isFilterActive={isFilterCurrentlyActive}
      />
      <div className={styles.taskCountContainer}>
        <div className={styles.taskCount}>
          {t('TASK.TASKS_COUNT', { count: taskCardContents.length })}
        </div>
        <AddLink onClick={onAddTask(dispatch, history, {})}>{t('TASK.ADD_TASK')}</AddLink>
      </div>

      <MuiFullPagePopup open={isFilterOpen} onClose={onFilterClose}>
        <TasksFilterPage onGoBack={onFilterClose} />
      </MuiFullPagePopup>

      {isFilterCurrentlyActive && (
        <ActiveFilterBox
          pageFilter={tasksFilter}
          pageFilterKey={'tasks'}
          style={{ marginBottom: '32px' }}
        />
      )}

      {taskCardContents.length > 0 ? (
        taskCardContents.map((task) => (
          <TaskCard
            key={task.task_id}
            onClick={() => history.push(`/tasks/${task.task_id}/read_only`)}
            style={{ marginBottom: '14px' }}
            taskCardContents={taskCardContents}
            {...task}
          />
        ))
      ) : (
        <Semibold style={{ color: 'var(--teal700)' }}>{t('TASK.NO_TASKS_TO_DISPLAY')}</Semibold>
      )}
    </Layout>
  );
}
