import React from 'react';
import PureField from '../../../components/AreaDetailsLayout/Field';
import { postFieldLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { fieldEnum } from '../../fieldSlice';
import { measurementSelector } from '../../userFarmSlice';
import { locationInfoSelector } from '../../mapSlice';

function FieldDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { area, perimeter, grid_points } = useSelector(locationInfoSelector);

  const submitForm = (data) => {
    dispatch(postFieldLocation(data));
  };

  return (
    <PureField
      history={history}
      submitForm={submitForm}
      areaType={fieldEnum}
      system={system}
      grid_points={grid_points}
      area={area}
      perimeter={perimeter}
    />
  );
}

export default FieldDetailForm;
