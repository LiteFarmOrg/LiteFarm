import React from 'react';
import PureResidence from '../../../../components/LocationDetailLayout/AreaDetailsLayout/Residence';
import { postResidenceLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { useLocationPageType } from '../../utils';

function ResidenceDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { isCreateLocationPage, isViewLocationPage, isEditLocationPage } = useLocationPageType(
    match,
  );

  const submitForm = (data) => {
    dispatch(postResidenceLocation(data));
  };
  return (
    <PureResidence
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

export default ResidenceDetailForm;
