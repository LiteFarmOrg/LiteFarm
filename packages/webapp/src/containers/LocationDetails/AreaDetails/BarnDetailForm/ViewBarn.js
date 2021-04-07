import React, { useEffect } from 'react';
import PureBarn from '../../../../components/LocationDetailLayout/AreaDetails/Barn';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { barnSelector } from '../../../barnSlice';
import { setAreaDetailFormData } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

function ViewBarnDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const barn = useSelector(barnSelector(match.params.location_id));
  useEffect(() => {
    dispatch(setAreaDetailFormData(barn));
  }, []);

  return (
    <PureBarn
      history={history}
      match={match}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isViewLocationPage
    />
  );
}

export default ViewBarnDetailForm;
