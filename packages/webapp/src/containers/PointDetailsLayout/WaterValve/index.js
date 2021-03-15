import React from 'react';
import PureWaterValve from '../../../components/PointDetailsLayout/WaterValve';
import { postWaterValveLocation } from './saga';
import { useDispatch } from 'react-redux';
import { resetLocationData } from '../../mapSlice';
import { waterValveEnum } from '../../waterValveSlice';

function WaterValve({ history }) {
  const dispatch = useDispatch();

  const submitForm = (data) => {
    dispatch(postWaterValveLocation(data));
    resetLocationData();
    history.push('/map');
  };

  return <PureWaterValve history={history} submitForm={submitForm} pointType={waterValveEnum} />;
}

export default WaterValve;
