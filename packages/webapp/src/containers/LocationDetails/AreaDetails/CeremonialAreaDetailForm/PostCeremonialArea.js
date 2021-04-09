import React from 'react';
import PureCeremonial from '../../../../components/LocationDetailLayout/AreaDetails/CeremonialArea';
import { postCeremonialLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';

function PostCeremonialDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

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
      isCreateLocationPage={true}
    />
  );
}

export default PostCeremonialDetailForm;
