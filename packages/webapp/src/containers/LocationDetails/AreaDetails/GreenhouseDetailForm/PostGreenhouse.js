import React from 'react';
import PureGreenhouse from '../../../../components/LocationDetailLayout/AreaDetails/Greenhouse';
import { postGreenhouseLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';

function PostGreenhouseDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

  const submitForm = (data) => {
    dispatch(postGreenhouseLocation(data));
  };

  return (
    <PureGreenhouse
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isCreateLocationPage={true}
    />
  );
}

export default PostGreenhouseDetailForm;
