import React from 'react';
import PureField from '../../../components/AreaDetailsLayout/Field';
import { postFieldLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { fieldEnum } from '../../fieldSlice';
import { measurementSelector } from '../../userFarmSlice';

function FieldDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

  const submitForm = (data) => {
    dispatch(postFieldLocation(data));
  };

  return (
    <PureField history={history} submitForm={submitForm} areaType={fieldEnum} system={system} />
  );
}

export default FieldDetailForm;
