import React, { useEffect } from 'react';
import PureFarmSiteBoundary from '../../../../components/LocationDetailLayout/AreaDetails/FarmSiteBoundary';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { farmSiteBoundarySelector } from '../../../farmSiteBoundarySlice';
import { setAreaDetailFormData } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

function ViewFarmSiteBoundaryDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const farmSiteBoundary = useSelector(farmSiteBoundarySelector(match.params.location_id));
  useEffect(() => {
    dispatch(setAreaDetailFormData(farmSiteBoundary));
  }, []);

  return (
    <PureFarmSiteBoundary
      history={history}
      match={match}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isViewLocationPage
    />
  );
}

export default ViewFarmSiteBoundaryDetailForm;
