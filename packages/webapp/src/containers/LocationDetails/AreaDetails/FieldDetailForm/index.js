import React from 'react';
import PureField from '../../../../components/LocationDetailLayout/AreaDetails/Field';
import { postFieldLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { useLocationPageType } from '../../utils';

function FieldDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { isCreateLocationPage, isViewLocationPage, isEditLocationPage } = useLocationPageType(
    match,
  );

  const submitForm = (data) => {
    dispatch(postFieldLocation(data));
  };

  return (
    <PureField
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

export default FieldDetailForm;
