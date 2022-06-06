/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import { AddLink, Semibold } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';

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
  setTasksFilterUnassignedDueThisWeek,
  setTasksFilterDueToday,
} from '../filterSlice';
import ActiveFilterBox from '../../components/ActiveFilterBox';
import PureTaskDropdownFilter from '../../components/PopupFilter/PureTaskDropdownFilter';
import produce from 'immer';
import { IS_ASCENDING } from '../Filter/constants';
import { WEEKLY_UNASSIGNED_TASKS, DAILY_TASKS_DUE_TODAY } from '../Notification/constants';
import { filteredTaskCardContentSelector } from './taskCardContentSelector';
import TaskCount from '../../components/Task/TaskCount';

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
    dispatch(resetAndUnLockFormData());

    const context = history.location?.state;

    let notificationDate;
    if (context?.notification_date) {
      const tempDate = new Date(context?.notification_date);
      notificationDate = new Date(
        tempDate.getUTCFullYear(),
        tempDate.getUTCMonth(),
        tempDate.getUTCDate(),
      );
    } else {
      notificationDate = new Date();
    }

    switch (context?.notification_type) {
      case WEEKLY_UNASSIGNED_TASKS:
        dispatch(setTasksFilterUnassignedDueThisWeek({ date: notificationDate }));
        break;
      case DAILY_TASKS_DUE_TODAY:
        dispatch(
          setTasksFilterDueToday({ user_id, first_name, last_name, date: notificationDate }),
        );
        break;
      default:
        break;
    }
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
      <TaskCount count={taskCardContents.length} handleAddTask={onAddTask(dispatch, history, {})} />

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
            {...task}
          />
        ))
      ) : (
        <Semibold style={{ color: 'var(--teal700)' }}>{t('TASK.NO_TASKS_TO_DISPLAY')}</Semibold>
      )}
    </Layout>
  );
}
