import React from 'react';
import PureSurfaceWater from '../../../components/AreaDetailsLayout/SurfaceWater';
import { postSurfaceWaterLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';

function SurfaceWaterDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

  const submitForm = (data) => {
    dispatch(postSurfaceWaterLocation(data));
  };

  return (
    <PureSurfaceWater
      history={history}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
    />
  );
}

export default SurfaceWaterDetailForm;
