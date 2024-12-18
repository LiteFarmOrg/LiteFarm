import { useMemo, useEffect } from 'react';
import {
  manualFilteredTaskCardContentSelector,
  getTaskStatus,
} from '../../Task/taskCardContentSelector';
import { isAdminSelector } from '../../userFarmSlice';
import { useSelector } from 'react-redux';
import { locationByIdSelector } from '../../locationSlice';
import PureLocationTasks from '../../../components/LocationTasks';
import { useNavigate, useParams } from 'react-router-dom';

export default function LocationTasks({ location: { pathname } }) {
  let navigate = useNavigate();
  const isAdmin = useSelector(isAdminSelector);

  const { location_id } = useParams();
  const location = useSelector(locationByIdSelector(location_id));

  useEffect(() => {
    if (location === undefined) {
      navigate('/unknown_record', { replace: true });
    }
  }, [location]);

  const areCropEnabled = ['field', 'garden', 'greenhouse', 'buffer_zone'];
  const areReadingEnabled = ['sensor'];

  const hasCrops = areCropEnabled.includes(pathname.split('/')[1]);
  const hasReadings = areReadingEnabled.includes(pathname.split('/')[1]);

  const filter = (taskList) => {
    const activeStatus = ['planned', 'late'];
    return taskList.filter(
      (t) =>
        t.locations.find((loc) => loc.location_id === location_id) &&
        activeStatus.includes(getTaskStatus(t)),
    );
  };

  const locationTasks = useSelector(manualFilteredTaskCardContentSelector(filter));

  const { tasks, count } = useMemo(() => {
    return locationTasks.reduce(
      (previous, current) => {
        previous.count++;
        if (!Object.keys(previous.tasks).includes(current.date)) {
          previous.tasks[current.date] = [current];
        } else {
          previous.tasks[current.date].push(current);
        }
        return previous;
      },
      { count: 0, tasks: {} },
    );
  }, [locationTasks]);

  return (
    <>
      {location && !location?.deleted && (
        <PureLocationTasks
          location={location}
          isAdmin={isAdmin}
          tasks={tasks}
          count={count}
          hasCrops={hasCrops}
          hasReadings={hasReadings}
        />
      )}
    </>
  );
}
