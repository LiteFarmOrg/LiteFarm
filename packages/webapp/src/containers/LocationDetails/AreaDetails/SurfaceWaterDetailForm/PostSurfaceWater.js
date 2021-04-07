import React from 'react';
import PureSurfaceWater from '../../../../components/LocationDetailLayout/AreaDetails/SurfaceWater';
import { postSurfaceWaterLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';

function PostSurfaceWaterDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

  const submitForm = (data) => {
    dispatch(postSurfaceWaterLocation(data));
  };

  return (
    <PureSurfaceWater
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isCreateLocationPage={true}
    />
  );
}

export default PostSurfaceWaterDetailForm;
