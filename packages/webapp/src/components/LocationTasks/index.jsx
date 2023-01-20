import React from 'react';
import Layout from '../Layout';
import PageTitle from '../PageTitle/v2';
import RouterTab from '../RouterTab';
import { useTranslation } from 'react-i18next';
import { Semibold } from '../Typography';
import TaskCount from '../Task/TaskCount';
import TaskCard from '../../containers/Task/TaskCard';
import PageBreak from '../PageBreak';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';
import { onAddTask } from '../../containers/Task/onAddTask';
import { useDispatch } from 'react-redux';

export default function PureLocationTasks({
  location,
  history,
  match,
  hasCrops,
  tasks,
  count,
  hasReadings,
  isAdmin,
}) {
  const language = getLanguageFromLocalStorage();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const renderTasksForDay = (dateString, tasksForDate) => (
    <div key={`tasks-${dateString}`}>
      <PageBreak
        style={{ paddingBottom: '22px' }}
        label={new Intl.DateTimeFormat(language).format(Date.parse(dateString))}
      />
      {tasksForDate.map((t) => (
        <TaskCard
          key={t.task_id}
          onClick={() => history.push(`/tasks/${t.task_id}/read_only`)}
          style={{ marginBottom: '14px' }}
          {...t}
        />
      ))}
    </div>
  );

  const renderTasksByDay = (tasks) => {
    return Object.keys(tasks)
      .sort((a, b) => {
        const dateA = Date.parse(a);
        const dateB = Date.parse(b);
        if (dateA < dateB) {
          return -1;
        } else if (dateB > dateA) {
          return 1;
        } else {
          return 0;
        }
      })
      .map((key) => renderTasksForDay(key, tasks[key]));
  };

  const routerTabs = [
    {
      label: t('FARM_MAP.TAB.TASKS'),
      path: match.url,
    },
    {
      label: t('FARM_MAP.TAB.DETAILS'),
      path: match.url.replace('tasks', 'details'),
    },
  ];

  if (hasCrops) {
    routerTabs.splice(0, 0, {
      label: t('FARM_MAP.TAB.CROPS'),
      path: match.url.replace('tasks', 'crops'),
    });
  } else if (hasReadings) {
    routerTabs.splice(0, 0, {
      label: t('FARM_MAP.TAB.READINGS'),
      path: match.url.replace('tasks', 'readings'),
    });
  }

  return (
    <Layout>
      <PageTitle title={location.name} onGoBack={() => history.push('/map')} />
      <RouterTab
        classes={{ container: { margin: '30px 0 26px 0' } }}
        history={history}
        match={match}
        tabs={routerTabs}
      />
      <TaskCount
        handleAddTask={onAddTask(dispatch, history, { location })}
        count={count}
        isAdmin={isAdmin}
      />
      {count > 0 ? (
        renderTasksByDay(tasks)
      ) : (
        <Semibold style={{ color: 'var(--teal700)' }}>{t('TASK.NO_TASKS_TO_DISPLAY')}</Semibold>
      )}
    </Layout>
  );
}
