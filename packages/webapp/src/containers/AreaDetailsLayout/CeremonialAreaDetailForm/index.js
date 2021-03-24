import React from 'react';
import PureCeremonialArea from '../../../components/AreaDetailsLayout/CeremonialArea';
import { postCeremonialLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import { locationInfoSelector } from '../../mapSlice';

function CeremonialAreaDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { grid_points } = useSelector(locationInfoSelector);
  const submitForm = (data) => {
    dispatch(postCeremonialLocation(data));
  };
  return (
    <PureCeremonialArea
      history={history}
      submitForm={submitForm}
      system={system}
      grid_points={grid_points}
    />
  );
}

export default CeremonialAreaDetailForm;
