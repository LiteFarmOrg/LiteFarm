import React from 'react';
import PureWaterValve from '../../../../components/LocationDetailLayout/PointDetailsLayout/WaterValve';
import { postWaterValveLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { useLocationPageType } from '../../utils';

function WaterValveDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { isCreateLocationPage, isViewLocationPage, isEditLocationPage } = useLocationPageType(
    match,
  );

  const submitForm = (data) => {
    dispatch(postWaterValveLocation(data));
  };

  return (
    <PureWaterValve
      history={history}
      match={match}
      submitForm={submitForm}
      useHookFormPersist={useHookFormPersist}
      isCreateLocationPage={isCreateLocationPage}
      isViewLocationPage={isViewLocationPage}
      isEditLocationPage={isEditLocationPage}
      system={system}
    />
  );
}

export default WaterValveDetailForm;
