import React, { useEffect } from 'react';
import PureBarn from '../../../../components/LocationDetailLayout/AreaDetails/Barn';
import { editBarnLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { barnSelector } from '../../../barnSlice';
import {
  hookFormPersistSelector,
  setAreaDetailFormData,
} from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getFormData } from '../../utils';

function EditBarnDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    dispatch(editBarnLocation({ ...data, ...match.params }));
  };
  const barn = useSelector(barnSelector(match.params.location_id));
  const formData = useSelector(hookFormPersistSelector);
  useEffect(() => {
    !formData.name && dispatch(setAreaDetailFormData(getFormData(barn)));
  }, []);

  return (
    <PureBarn
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isEditLocationPage
    />
  );
}

export default EditBarnDetailForm;
