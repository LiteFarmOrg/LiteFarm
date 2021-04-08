import React, { useEffect } from 'react';
import PureField from '../../../../components/LocationDetailLayout/AreaDetails/Field';
import { editFieldLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { fieldSelector } from '../../../fieldSlice';
import {
  hookFormPersistSelector,
  setAreaDetailFormData,
} from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getFormData, useLocationPageType } from '../../utils';

function EditFieldDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    isEditLocationPage &&
      dispatch(editFieldLocation({ ...data, ...match.params, figure_id: field.figure_id }));
  };
  const field = useSelector(fieldSelector(match.params.location_id));
  const formData = useSelector(hookFormPersistSelector);
  useEffect(() => {
    dispatch(setAreaDetailFormData(getFormData(field)));
  }, []);
  const { isCreateLocationPage, isViewLocationPage, isEditLocationPage } = useLocationPageType(
    match,
  );
  return (
    <PureField
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isEditLocationPage={isEditLocationPage}
      isViewLocationPage={isViewLocationPage}
    />
  );
}

export default EditFieldDetailForm;
