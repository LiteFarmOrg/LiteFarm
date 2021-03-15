import React from 'react';
import PureFarmSiteBoundary from '../../../components/AreaDetailsLayout/FarmSiteBoundary';
import { postFarmSiteLocation } from './saga';
import { useDispatch } from 'react-redux';
import { resetLocationData } from '../../mapSlice';
import { farmSiteBoundaryEnum } from '../../farmSiteBoundarySlice';

function FarmSiteBoundary({ history }) {
  const dispatch = useDispatch();

  const submitForm = (data) => {
    dispatch(postFarmSiteLocation(data));
    dispatch(resetLocationData());
  };
  return (
    <PureFarmSiteBoundary
      history={history}
      submitForm={submitForm}
      areaType={farmSiteBoundaryEnum}
    />
  );
}

export default FarmSiteBoundary;
