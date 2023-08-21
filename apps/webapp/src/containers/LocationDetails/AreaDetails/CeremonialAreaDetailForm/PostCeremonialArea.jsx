import React from 'react';
import PureCeremonial from '../../../../components/LocationDetailLayout/AreaDetails/CeremonialArea';
import { postCeremonialLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

function PostCeremonialDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const persistedFormData = useSelector(hookFormPersistSelector);

  const submitForm = (data) => {
    dispatch(postCeremonialLocation(data));
  };

  return (
    <PureCeremonial
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      persistedFormData={persistedFormData}
      isCreateLocationPage={true}
    />
  );
}

export default PostCeremonialDetailForm;
