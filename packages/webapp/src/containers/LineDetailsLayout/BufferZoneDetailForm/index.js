import React from 'react';
import PureBufferZone from '../../../components/LineDetailsLayout/BufferZone';
import { postBufferZoneLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';

function FenceDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

  const submitForm = (data) => {
    dispatch(postBufferZoneLocation(data));
  };

  return (
    <PureBufferZone
      history={history}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
    />
  );
}

export default FenceDetailForm;
