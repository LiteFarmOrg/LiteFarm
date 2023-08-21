import React, { useMemo } from 'react';
import PureTaskDate from '../../../components/Task/TaskDate';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useIsTaskType } from '../useIsTaskType';
import { useSelector } from 'react-redux';
import { tasksByManagementPlanIdSelector } from '../../taskSlice';

function TaskDate({ history, match, location }) {
  const onGoBack = () => {
    history.back();
  };
  const isTransplantTask = useIsTaskType('TRANSPLANT_TASK');

  const tasks = location.state.management_plan_id
    ? useSelector(tasksByManagementPlanIdSelector(location.state.management_plan_id))
    : [];

  const onContinue = (date) => () => {
    if (tasks.length > 0) {
      const { transplantTask, plantingTask, mostRecentlyCompleted, nextUpcoming } = tasks.reduce(
        (previous, current) => {
          if (
            current.task_type_id === 19 &&
            Date.parse(current.due_date) < Date.parse(date) &&
            (previous.transplantTask === null ??
              Date.parse(previous.transplantTask.due_date) < Date.parse(current.due_date))
          ) {
            previous.transplantTask = current;
          } else if (current.task_type_id === 5 && current.complete_date !== null) {
            previous.plantingTask = current;
          } else if (
            current.complete_date !== null &&
            (previous.mostRecentlyCompleted === null ??
              Date.parse(current.complete_date) >
                Date.parse(previous.mostRecentlyCompleted.complete_date))
          ) {
            previous.mostRecentlyCompleted = current;
          } else if (
            previous.nextUpcoming === null ??
            Date.parse(current.due_date) < Date.parse(previous.nextUpcoming.due_date)
          ) {
            previous.nextUpcoming = current;
          }
          return previous;
        },
        {
          transplantTask: null,
          plantingTask: null,
          mostRecentlyCompleted: null,
          nextUpcoming: null,
        },
      );
      if (transplantTask) {
        console.log('transplantTask');
        location.state.location = transplantTask.locations[0];
        console.log(location.state);
      } else if (plantingTask) {
        console.log('plantingTask');
        location.state.location = plantingTask.locations[0];
        console.log(location.state);
      } else if (mostRecentlyCompleted) {
        console.log('mostRecentlyCompleted');
        location.state.location = mostRecentlyCompleted.locations[0];
        console.log(location.state);
      } else if (nextUpcoming) {
        console.log('nextUpcoming');
        location.state.location = nextUpcoming.locations[0];
        console.log(location.state);
      }
    }

    history.push(
      isTransplantTask ? '/add_task/task_crops' : '/add_task/task_locations',
      location?.state,
    );
  };

  return (
    <HookFormPersistProvider>
      <PureTaskDate onGoBack={onGoBack} onContinue={onContinue} />
    </HookFormPersistProvider>
  );
}

export default TaskDate;
