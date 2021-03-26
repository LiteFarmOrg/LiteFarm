import React from 'react';
import PureCeremonialArea from '../../../components/AreaDetailsLayout/CeremonialArea';
import { postCeremonialLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';

function CeremonialAreaDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

  const submitForm = (data) => {
    dispatch(postCeremonialLocation(data));
  };
  return (
    <PureCeremonialArea
      history={history}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
    />
  );
}

export default CeremonialAreaDetailForm;
