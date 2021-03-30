import React from 'react';
import PureBarn from '../../../components/AreaDetailsLayout/Barn';
import { postBarnLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';

function BarnDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

  const submitForm = (data) => {
    dispatch(postBarnLocation(data));
  };

  return (
    <PureBarn
      history={history}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
    />
  );
}

export default BarnDetailForm;
