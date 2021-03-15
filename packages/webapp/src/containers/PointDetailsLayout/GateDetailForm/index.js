import React from 'react';
import PureGate from '../../../components/PointDetailsLayout/Gate';
import { postGateLocation } from './saga';
import { useDispatch } from 'react-redux';
import { gateEnum } from '../../gateSlice';

function GateDetailForm({ history }) {
  const dispatch = useDispatch();

  const submitForm = (data) => {
    dispatch(postGateLocation(data));
  };

  return <PureGate history={history} submitForm={submitForm} pointType={gateEnum} />;
}

export default GateDetailForm;
