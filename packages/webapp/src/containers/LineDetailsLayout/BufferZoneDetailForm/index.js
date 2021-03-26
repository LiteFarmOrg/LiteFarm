import React from 'react';
import PureBufferZone from '../../../components/LineDetailsLayout/BufferZone';
import { postBufferZoneLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import { locationInfoSelector } from '../../mapSlice';

function FenceDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { line_points, width_display, width } = useSelector(locationInfoSelector);

  const submitForm = (data) => {
    dispatch(postBufferZoneLocation(data));
  };

  return (
    <PureBufferZone
      history={history}
      submitForm={submitForm}
      system={system}
      line_points={line_points}
      width_display={width_display}
      width={width}
    />
  );
}

export default FenceDetailForm;
