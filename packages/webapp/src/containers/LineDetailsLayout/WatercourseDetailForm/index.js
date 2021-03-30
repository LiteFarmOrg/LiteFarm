import React from 'react';
import PureWatercourse from '../../../components/LineDetailsLayout/Watercourse';
import { postWatercourseLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import { locationInfoSelector } from '../../mapSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';

function WatercourseDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const {
    line_points,
    length,
    width,
    width_display,
    buffer_width,
    buffer_width_display,
  } = useSelector(locationInfoSelector);

  const submitForm = (data) => {
    dispatch(postWatercourseLocation(data));
  };

  return (
    <PureWatercourse
      history={history}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
    />
  );
}

export default WatercourseDetailForm;
