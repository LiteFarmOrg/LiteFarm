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
import { getFormData } from '../../utils';

function EditFieldDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    dispatch(editFieldLocation({ ...data, ...match.params }));
  };
  const field = useSelector(fieldSelector(match.params.location_id));
  const formData = useSelector(hookFormPersistSelector);
  useEffect(() => {
    !formData.name && dispatch(setAreaDetailFormData(getFormData(field)));
  }, []);

  return (
    <PureField
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isEditLocationPage
    />
  );
}

export default EditFieldDetailForm;
