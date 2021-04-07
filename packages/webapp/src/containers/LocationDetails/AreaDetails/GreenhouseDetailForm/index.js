import React from 'react';
import PureGreenhouse from '../../../../components/LocationDetailLayout/AreaDetails/Greenhouse';
import { postGreenhouseLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { useLocationPageType } from '../../utils';

function GreenhouseDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { isCreateLocationPage, isViewLocationPage, isEditLocationPage } = useLocationPageType(
    match,
  );

  const submitForm = (data) => {
    dispatch(postGreenhouseLocation(data));
  };

  return (
    <PureGreenhouse
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

export default GreenhouseDetailForm;
