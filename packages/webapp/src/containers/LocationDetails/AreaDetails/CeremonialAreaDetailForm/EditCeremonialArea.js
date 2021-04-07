import React, { useEffect } from 'react';
import PureCeremonial from '../../../../components/LocationDetailLayout/AreaDetails/CeremonialArea';
import { editCeremonialLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { ceremonialSelector } from '../../../ceremonialSlice';
import {
  hookFormPersistSelector,
  setAreaDetailFormData,
} from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

function EditCeremonialDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    dispatch(editCeremonialLocation({ ...data, ...match.params }));
  };
  const ceremonial = useSelector(ceremonialSelector(match.params.location_id));
  const formData = useSelector(hookFormPersistSelector);
  useEffect(() => {
    !formData.name && dispatch(setAreaDetailFormData(ceremonial));
  }, []);

  return (
    <PureCeremonial
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isEditLocationPage
    />
  );
}

export default EditCeremonialDetailForm;
