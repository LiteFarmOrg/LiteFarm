import React from 'react';
import PureWaterValve from '../../../components/PointDetailsLayout/WaterValve';
import { postWaterValveLocation } from './saga';
import { useDispatch } from 'react-redux';
import { waterValveEnum } from '../../waterValveSlice';
import { resetLocationData } from '../../mapSlice';

function WaterValveDetailForm({ history }) {
  const dispatch = useDispatch();

  const submitForm = (data) => {
    dispatch(postWaterValveLocation(data, dispatch));
    dispatch(resetLocationData());
  };

  return <PureWaterValve history={history} submitForm={submitForm} pointType={waterValveEnum} />;
}

export default WaterValveDetailForm;
