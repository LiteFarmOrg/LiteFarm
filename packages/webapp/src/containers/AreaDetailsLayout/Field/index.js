import React from 'react';
import PureField from '../../../components/AreaDetailsLayout/Field';
import { postFieldLocation } from './saga';
import { useDispatch } from 'react-redux';
import { resetLocationData } from '../../mapSlice';
import { fieldEnum } from '../../fieldSlice';

function AreaDetailsField({ history }) {
  const dispatch = useDispatch();

  const submitForm = (data) => {
    dispatch(postFieldLocation(data));
    dispatch(resetLocationData());
  };

  return <PureField history={history} submitForm={submitForm} areaType={fieldEnum} />;
}

export default AreaDetailsField;
