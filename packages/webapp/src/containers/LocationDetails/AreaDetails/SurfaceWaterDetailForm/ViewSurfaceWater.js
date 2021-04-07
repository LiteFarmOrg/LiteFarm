import React, { useEffect } from 'react';
import PureSurfaceWater from '../../../../components/LocationDetailLayout/AreaDetails/SurfaceWater';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { surfaceWaterSelector } from '../../../surfaceWaterSlice';
import { setAreaDetailFormData } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

function ViewSurfaceWaterDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const surfaceWater = useSelector(surfaceWaterSelector(match.params.location_id));
  useEffect(() => {
    dispatch(setAreaDetailFormData(surfaceWater));
  }, []);

  return (
    <PureSurfaceWater
      history={history}
      match={match}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isViewLocationPage
    />
  );
}

export default ViewSurfaceWaterDetailForm;
