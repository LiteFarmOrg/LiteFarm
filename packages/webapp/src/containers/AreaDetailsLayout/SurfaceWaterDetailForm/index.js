import React from 'react';
import PureSurfaceWater from '../../../components/AreaDetailsLayout/SurfaceWater';
import { postSurfaceWaterLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import { locationInfoSelector } from '../../mapSlice';

function SurfaceWaterDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { grid_points } = useSelector(locationInfoSelector);
  const submitForm = (data) => {
    dispatch(postSurfaceWaterLocation(data));
  };

  return (
    <PureSurfaceWater
      history={history}
      submitForm={submitForm}
      system={system}
      grid_points={grid_points}
    />
  );
}

export default SurfaceWaterDetailForm;
