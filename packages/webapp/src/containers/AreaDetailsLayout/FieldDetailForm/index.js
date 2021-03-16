import React from 'react';
import PureField from '../../../components/AreaDetailsLayout/Field';
import { postFieldLocation } from './saga';
import { useDispatch } from 'react-redux';
import { fieldEnum } from '../../fieldSlice';

function FieldDetailForm({ history }) {
  const dispatch = useDispatch();

  const submitForm = (data) => {
    dispatch(postFieldLocation(data));
  };

  return <PureField history={history} submitForm={submitForm} areaType={fieldEnum} />;
}

export default FieldDetailForm;
