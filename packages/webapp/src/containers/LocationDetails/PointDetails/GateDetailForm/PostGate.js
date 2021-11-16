import React from 'react';
import PureGate from '../../../../components/LocationDetailLayout/PointDetails/Gate';
import { postGateLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';

function PostGateDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

  const submitForm = (data) => {
    dispatch(postGateLocation(data));
  };

  return (
    <PureGate
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isCreateLocationPage={true}
    />
  );
}

export default PostGateDetailForm;
