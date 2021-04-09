import React from 'react';
import PureFence from '../../../../components/LocationDetailLayout/LineDetails/Fence';
import { postFenceLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';

function PostFenceDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

  const submitForm = (data) => {
    dispatch(postFenceLocation(data));
  };

  return (
    <PureFence
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isCreateLocationPage={true}
    />
  );
}

export default PostFenceDetailForm;
