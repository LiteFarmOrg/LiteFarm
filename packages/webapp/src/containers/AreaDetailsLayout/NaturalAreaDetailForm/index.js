import React from 'react';
import PureNaturalArea from '../../../components/AreaDetailsLayout/NaturalArea';
import { postNaturalAreaLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';

function NauralAreaDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

  const submitForm = (data) => {
    dispatch(postNaturalAreaLocation(data));
  };
  return (
    <PureNaturalArea
      history={history}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
    />
  );
}

export default NauralAreaDetailForm;
