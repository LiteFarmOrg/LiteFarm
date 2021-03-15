import React from 'react';
import PureWaterValve from '../../../components/PointDetailsLayout/WaterValve';
import { postWaterValveLocation } from './saga';
import { useDispatch } from 'react-redux';
import { waterValveEnum } from '../../waterValveSlice';

function WaterValveDetailForm({ history }) {
  const dispatch = useDispatch();

  const submitForm = (data) => {
    dispatch(postWaterValveLocation(data));
  };

  return <PureWaterValve history={history} submitForm={submitForm} pointType={waterValveEnum} />;
}

export default WaterValveDetailForm;
