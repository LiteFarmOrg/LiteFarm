import React from 'react';
import PureGate from '../../../components/PointDetailsLayout/Gate';
import { postGateLocation } from './saga';
import { useDispatch } from 'react-redux';
import { resetLocationData } from '../../mapSlice';
import { gateEnum } from '../../gateSlice';

function Gate({ history }) {
  const dispatch = useDispatch();

  const submitForm = (data) => {
    dispatch(postGateLocation(data));
    resetLocationData();
    history.push('/map');
  };

  return <PureGate history={history} submitForm={submitForm} pointType={gateEnum} />;
}

export default Gate;
