import React from 'react';
import PureWatercourse from '../../../../components/LocationDetailLayout/LineDetails/Watercourse';
import { postWatercourseLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

function PostWatercourseDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const persistedFormData = useSelector(hookFormPersistSelector);

  const submitForm = (data) => {
    dispatch(postWatercourseLocation(data));
  };

  return (
    <PureWatercourse
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

export default PostWatercourseDetailForm;
