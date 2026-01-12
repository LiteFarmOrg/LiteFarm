import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isAdminSelector } from '../../userFarmSlice';
import { useDispatch, useSelector } from 'react-redux';
import { locationByIdSelector } from '../../locationSlice';
import PureLocationTasks from '../../../components/LocationTasks';
import useLocationTasks from './useLocationTasks';
import useLocationRouterTabs from '../useLocationRouterTabs';
import { onAddTask } from '../../Task/onAddTask';

export default function LocationTasks() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAdmin = useSelector(isAdminSelector);
  const { location_id } = useParams();
  const location = useSelector(locationByIdSelector(location_id));
  const routerTabs = useLocationRouterTabs(location);

  useEffect(() => {
    if (location === undefined) {
      navigate('/unknown_record', { replace: true });
    }
  }, [location]);

  const { tasks, count } = useLocationTasks(location_id);

  return (
    <>
      {location && !location?.deleted && (
        <PureLocationTasks
          location={location}
          isAdmin={isAdmin}
          tasks={tasks}
          count={count}
          routerTabs={routerTabs}
          handleAddTask={onAddTask(dispatch, navigate, { location })}
        />
      )}
    </>
  );
}
