import React, { useEffect } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PureHarvestCompleteQuantity from '../../../../components/Task/TaskComplete/HarvestComplete/Quantity';
import { measurementSelector } from '../../../userFarmSlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import { taskWithProductSelector } from '../../../taskSlice';
import { useDispatch } from 'react-redux';
import { setPersistedPaths } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

function HarvestCompleteQuantity() {
  const history = useHistory();
  const location = useLocation();
  const system = useSelector(measurementSelector);
  const { task_id } = useParams();
  const persistedPaths = [`/tasks/${task_id}/harvest_uses`];
  const task = useSelector(taskWithProductSelector(task_id));

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      setPersistedPaths([
        `/tasks/${task_id}/complete_harvest_quantity`,
        `/tasks/${task_id}/complete`,
        `/tasks/${task_id}/before_complete`,
        `/tasks/${task_id}/harvest_uses`,
      ]),
    );
  }, []);

  const onContinue = (data) => {
    history.push(`/tasks/${task_id}/harvest_uses`, location?.state);
  };

  const onGoBack = () => {
    history.back();
  };

  return (
    <HookFormPersistProvider>
      <PureHarvestCompleteQuantity
        onGoBack={onGoBack}
        onContinue={onContinue}
        system={system}
        task={task}
        persistedPaths={persistedPaths}
      />
    </HookFormPersistProvider>
  );
}

export default HarvestCompleteQuantity;
