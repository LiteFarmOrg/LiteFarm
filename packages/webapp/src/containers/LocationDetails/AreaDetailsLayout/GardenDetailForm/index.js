import React from 'react';
import PureGarden from '../../../../components/LocationDetailLayout/AreaDetailsLayout/Garden';
import { postGardenLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { useLocationPageType } from '../../utils';

function GardenDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { isCreateLocationPage, isViewLocationPage, isEditLocationPage } = useLocationPageType(
    match,
  );

  const submitForm = (data) => {
    dispatch(postGardenLocation(data));
  };

  return (
    <PureGarden
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isCreateLocationPage={isCreateLocationPage}
      isViewLocationPage={isViewLocationPage}
      isEditLocationPage={isEditLocationPage}
    />
  );
}

export default GardenDetailForm;
