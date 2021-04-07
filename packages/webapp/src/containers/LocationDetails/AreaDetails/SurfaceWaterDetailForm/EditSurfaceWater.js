import React, { useEffect } from 'react';
import PureSurfaceWater from '../../../../components/LocationDetailLayout/AreaDetails/SurfaceWater';
import { editSurfaceWaterLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { surfaceWaterSelector } from '../../../surfaceWaterSlice';
import {
  hookFormPersistSelector,
  setAreaDetailFormData,
} from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

function EditSurfaceWaterDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    dispatch(editSurfaceWaterLocation({ ...data, ...match.params }));
  };
  const surfaceWater = useSelector(surfaceWaterSelector(match.params.location_id));
  const formData = useSelector(hookFormPersistSelector);
  useEffect(() => {
    !formData.name && dispatch(setAreaDetailFormData(surfaceWater));
  }, []);

  return (
    <PureSurfaceWater
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isEditLocationPage
    />
  );
}

export default EditSurfaceWaterDetailForm;
