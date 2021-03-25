import React from 'react';
import PureResidence from '../../../components/AreaDetailsLayout/Residence';
import { postResidenceLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import { locationInfoSelector } from '../../mapSlice';

function ResidenceDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { area, perimeter, grid_points } = useSelector(locationInfoSelector);
  const submitForm = (data) => {
    dispatch(postResidenceLocation(data));
  };
  return (
    <PureResidence
      history={history}
      submitForm={submitForm}
      system={system}
      grid_points={grid_points}
      area={area}
      perimeter={perimeter}
    />
  );
}

export default ResidenceDetailForm;
