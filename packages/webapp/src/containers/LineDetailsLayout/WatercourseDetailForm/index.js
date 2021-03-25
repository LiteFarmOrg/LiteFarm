import React from 'react';
import PureWatercourse from '../../../components/LineDetailsLayout/Watercourse';
// import { postFieldLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import { locationInfoSelector } from '../../mapSlice';

function WatercourseDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  //   const { line_points, length } = useSelector(locationInfoSelector);

  const submitForm = (data) => {
    // dispatch(postFieldLocation(data));
  };

  return (
    <PureWatercourse
      history={history}
      submitForm={submitForm}
      system={system}
      //   line_points={line_points}
      //   length={length}
    />
  );
}

export default WatercourseDetailForm;
