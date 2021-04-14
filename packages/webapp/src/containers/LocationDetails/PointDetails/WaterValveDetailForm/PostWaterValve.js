import React from 'react';
import PureWaterValve from '../../../../components/LocationDetailLayout/PointDetails/WaterValve';
import { postWaterValveLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';

function PostWaterValveDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

  const submitForm = (data) => {
    dispatch(postWaterValveLocation(data));
  };

  return (
    <PureWaterValve
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isCreateLocationPage={true}
    />
  );
}

export default PostWaterValveDetailForm;
