import React from 'react';
import PureWaterValve from '../../../components/PointDetailsLayout/WaterValve';
import { postWaterValveLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';

function WaterValveDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

  const submitForm = (data) => {
    dispatch(postWaterValveLocation(data));
  };

  return (
    <PureWaterValve
      history={history}
      submitForm={submitForm}
      useHookFormPersist={useHookFormPersist}
      system={system}
    />
  );
}

export default WaterValveDetailForm;
