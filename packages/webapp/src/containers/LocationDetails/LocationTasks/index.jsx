import { useMemo, useEffect } from 'react';
import {
  manualFilteredTaskCardContentSelector,
  getTaskStatus,
} from '../../Task/taskCardContentSelector';
import { isAdminSelector } from '../../userFarmSlice';
import { useSelector } from 'react-redux';
import { locationByIdSelector } from '../../locationSlice';
import PureLocationTasks from '../../../components/LocationTasks';
import { useLocation, useNavigate, useParams } from 'react-router';

export default function LocationTasks() {
  let navigate = useNavigate();
  let location = useLocation();
  const isAdmin = useSelector(isAdminSelector);

  const { location_id } = useParams();
  const farmLocation = useSelector(locationByIdSelector(location_id));

  useEffect(() => {
    if (farmLocation === undefined) {
      navigate('/unknown_record', { replace: true });
    }
  }, [farmLocation]);

  const areCropEnabled = ['field', 'garden', 'greenhouse', 'buffer_zone'];
  const areReadingEnabled = ['sensor'];

  const hasCrops = areCropEnabled.includes(location.pathname.split('/')[1]);
  const hasReadings = areReadingEnabled.includes(location.pathname.split('/')[1]);

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
      {farmLocation && !farmLocation?.deleted && (
        <PureLocationTasks
          farmLocation={farmLocation}
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
