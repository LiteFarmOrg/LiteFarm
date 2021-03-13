import React from 'react';
import PureFarmSiteBoundary from '../../../components/AreaDetailsLayout/FarmSiteBoundary';
import { postFarmSiteLocation } from './saga';
import { useDispatch } from 'react-redux';
import { resetLocationData } from '../../mapSlice';

function FarmSiteBoundary({ history }) {
  const dispatch = useDispatch();

  const submitForm = (data) => {
    dispatch(postFarmSiteLocation(data));
    resetLocationData();
    history.push('/map');
  };
  return <PureFarmSiteBoundary history={history} submitForm={submitForm} />;
}

export default FarmSiteBoundary;
