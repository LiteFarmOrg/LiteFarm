import React from 'react';
import PureFarmSiteBoundary from '../../../../components/LocationDetailLayout/AreaDetails/FarmSiteBoundary';
import { postFarmSiteBoundaryLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';

function PostFarmSiteBoundaryDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

  const submitForm = (data) => {
    dispatch(postFarmSiteBoundaryLocation(data));
  };

  return (
    <PureFarmSiteBoundary
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isCreateLocationPage={true}
    />
  );
}

export default PostFarmSiteBoundaryDetailForm;
