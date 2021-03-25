import React from 'react';
import PureWaterValve from '../../../components/PointDetailsLayout/WaterValve';
import { postWaterValveLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { locationInfoSelector } from '../../mapSlice';
import { measurementSelector } from '../../userFarmSlice';

function WaterValveDetailForm({ history }) {
  const dispatch = useDispatch();
  const { point } = useSelector(locationInfoSelector);
  const system = useSelector(measurementSelector);

  const submitForm = (data) => {
    dispatch(postWaterValveLocation(data));
  };

  return <PureWaterValve history={history} submitForm={submitForm} point={point} system={system} />;
}

export default WaterValveDetailForm;
