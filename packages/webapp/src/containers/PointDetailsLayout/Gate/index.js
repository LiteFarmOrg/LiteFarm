import React from 'react';
import PureGate from '../../../components/PointDetailsLayout/Gate';
import { postGateLocation } from './saga';
import { useDispatch } from 'react-redux';
import { resetLocationData } from '../../mapSlice';

function Gate({ history }) {
  const dispatch = useDispatch();

  const submitForm = (data) => {
    dispatch(postGateLocation(data));
    resetLocationData();
    history.push('/map');
  };

  return <PureGate history={history} submitForm={submitForm} />;
}

export default Gate;
