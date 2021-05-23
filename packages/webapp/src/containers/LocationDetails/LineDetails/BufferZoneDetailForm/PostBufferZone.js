import React from 'react';
import PureBufferZone from '../../../../components/LocationDetailLayout/LineDetails/BufferZone';
import { postBufferZoneLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';

function PostBufferZoneDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

  const submitForm = (data) => {
    dispatch(postBufferZoneLocation(data));
  };

  return (
    <PureBufferZone
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isCreateLocationPage={true}
    />
  );
}

export default PostBufferZoneDetailForm;
