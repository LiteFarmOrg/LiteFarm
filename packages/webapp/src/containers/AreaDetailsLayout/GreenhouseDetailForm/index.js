import React from 'react';
import PureGreenhouse from '../../../components/AreaDetailsLayout/Greenhouse';
import { postGreenhouseLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import { locationInfoSelector } from '../../mapSlice';

function GreenhouseDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { grid_points } = useSelector(locationInfoSelector);

  const submitForm = (data) => {
    dispatch(postGreenhouseLocation(data));
  };

  return (
    <PureGreenhouse
      history={history}
      submitForm={submitForm}
      system={system}
      grid_points={grid_points}
    />
  );
}

export default GreenhouseDetailForm;
