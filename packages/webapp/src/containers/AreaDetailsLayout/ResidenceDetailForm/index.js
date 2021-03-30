import React from 'react';
import PureResidence from '../../../components/AreaDetailsLayout/Residence';
import { postResidenceLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';

function ResidenceDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

  const submitForm = (data) => {
    dispatch(postResidenceLocation(data));
  };
  return (
    <PureResidence
      history={history}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
    />
  );
}

export default ResidenceDetailForm;
