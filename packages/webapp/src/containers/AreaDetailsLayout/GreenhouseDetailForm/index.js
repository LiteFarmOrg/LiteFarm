import React from 'react';
import PureGreenhouse from '../../../components/AreaDetailsLayout/Greenhouse';
import { postGreenhouseLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';

function GreenhouseDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

  const submitForm = (data) => {
    dispatch(postGreenhouseLocation(data));
  };

  return (
    <PureGreenhouse
      history={history}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
    />
  );
}

export default GreenhouseDetailForm;
