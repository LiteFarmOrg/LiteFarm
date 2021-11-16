import React from 'react';
import PureWatercourse from '../../../../components/LocationDetailLayout/LineDetails/Watercourse';
import { postWatercourseLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';

function PostWatercourseDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);

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
      isCreateLocationPage={true}
    />
  );
}

export default PostWatercourseDetailForm;
