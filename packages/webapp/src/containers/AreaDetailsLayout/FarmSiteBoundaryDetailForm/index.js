import React from 'react';
import PureFarmSiteBoundary from '../../../components/AreaDetailsLayout/FarmSiteBoundary';
import { postFarmSiteLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { farmSiteBoundaryEnum } from '../../farmSiteBoundarySlice';
import { measurementSelector } from '../../userFarmSlice';
import { locationInfoSelector } from '../../mapSlice';

function FarmSiteBoundaryDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { area, perimeter, grid_points } = useSelector(locationInfoSelector);
  const submitForm = (data) => {
    dispatch(postFarmSiteLocation(data));
  };
  return (
    <PureFarmSiteBoundary
      history={history}
      submitForm={submitForm}
      system={system}
      grid_points={grid_points}
      areaType={farmSiteBoundaryEnum}
      area={area}
      perimeter={perimeter}
    />
  );
}

export default FarmSiteBoundaryDetailForm;
