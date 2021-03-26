import React from 'react';
import PureWatercourse from '../../../components/LineDetailsLayout/Watercourse';
import { postWatercourseLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import { locationInfoSelector } from '../../mapSlice';

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
      line_points={line_points}
      length={length}
      width={width}
      width_display={width_display}
      buffer_width={buffer_width}
      buffer_width_display={buffer_width_display}
    />
  );
}

export default WatercourseDetailForm;
