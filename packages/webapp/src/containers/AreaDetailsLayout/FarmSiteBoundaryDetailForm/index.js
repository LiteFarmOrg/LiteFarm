import React from 'react';
import PureFarmSiteBoundary from '../../../components/AreaDetailsLayout/FarmSiteBoundary';
import { postFarmSiteLocation } from './saga';
import { useDispatch } from 'react-redux';
import { farmSiteBoundaryEnum } from '../../farmSiteBoundarySlice';

function FarmSiteBoundaryDetailForm({ history }) {
  const dispatch = useDispatch();

  const submitForm = (data) => {
    dispatch(postFarmSiteLocation(data));
  };
  return (
    <PureFarmSiteBoundary
      history={history}
      submitForm={submitForm}
      areaType={farmSiteBoundaryEnum}
    />
  );
}

export default FarmSiteBoundaryDetailForm;
