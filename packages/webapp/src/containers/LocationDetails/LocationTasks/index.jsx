import { useEffect } from 'react';
import { isAdminSelector } from '../../userFarmSlice';
import { useDispatch, useSelector } from 'react-redux';
import { locationByIdSelector } from '../../locationSlice';
import PureLocationTasks from '../../../components/LocationTasks';
import useLocationTasks from './useLocationTasks';
import useLocationRouterTabs from '../useLocationRouterTabs';
import { onAddTask } from '../../Task/onAddTask';

export default function LocationTasks({ history, match }) {
  const dispatch = useDispatch();
  const isAdmin = useSelector(isAdminSelector);
  const { location_id } = match.params;
  const location = useSelector(locationByIdSelector(location_id));
  const routerTabs = useLocationRouterTabs(location, match);

  useEffect(() => {
    if (location === undefined) {
      history.replace('/unknown_record');
    }
  }, [location]);

  const { tasks, count } = useLocationTasks(location_id);

  return (
    <>
      {location && !location?.deleted && (
        <PureLocationTasks
          history={history}
          match={match}
          location={location}
          isAdmin={isAdmin}
          tasks={tasks}
          count={count}
          routerTabs={routerTabs}
          handleAddTask={onAddTask(dispatch, history, { location })}
        />
      )}
    </>
  );
}
