import { useNavigate } from 'react-router-dom';
import CardLayout from '../Layout/CardLayout';
import PageTitle from '../PageTitle/v2';
import RouterTab from '../RouterTab';
import { useTranslation } from 'react-i18next';
import { Semibold } from '../Typography';
import TaskCount from '../Task/TaskCount';
import TaskCard from '../../containers/Task/TaskCard';
import PageBreak from '../PageBreak';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';
import { Variant } from '../RouterTab/Tab';
import FloatingActionButton from '../Button/FloatingActionButton';
import styles from './styles.module.scss';

export default function PureLocationTasks({ location, tasks, count, routerTabs, handleAddTask }) {
  const language = getLanguageFromLocalStorage();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const renderTasksForDay = (dateString, tasksForDate) => (
    <div key={`tasks-${dateString}`}>
      <PageBreak
        style={{ paddingBottom: '22px' }}
        label={new Intl.DateTimeFormat(language).format(Date.parse(dateString))}
      />
      {tasksForDate.map((t) => (
        <TaskCard
          key={t.task_id}
          onClick={() => navigate(`/tasks/${t.task_id}/read_only`)}
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

  return (
    <>
      <CardLayout>
        <PageTitle title={location.name} onGoBack={() => navigate('/map')} />
        <RouterTab
          classes={{ container: { margin: '30px 0 26px 0' } }}
          tabs={routerTabs}
          variant={Variant.UNDERLINE}
        />
        <TaskCount count={count} />
        {count > 0 ? (
          renderTasksByDay(tasks)
        ) : (
          <Semibold style={{ color: 'var(--teal700)' }}>{t('TASK.NO_TASKS_TO_DISPLAY')}</Semibold>
        )}
      </CardLayout>
      <div className={styles.ctaButtonWrapper}>
        <FloatingActionButton
          type={'add'}
          onClick={handleAddTask}
          aria-label={t('TASK.ADD_TASK')}
        />
      </div>
    </>
  );
}
