import React from 'react';
import PureFence from '../../../components/LineDetailsLayout/Fence';
import { postFenceLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';

function FenceDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

  const submitForm = (data) => {
    dispatch(postFenceLocation(data));
  };

  return (
    <PureFence
      history={history}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
    />
  );
}

export default FenceDetailForm;
