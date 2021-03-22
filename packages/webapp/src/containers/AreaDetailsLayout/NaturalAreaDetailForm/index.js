import React from 'react';
import PureNaturalArea from '../../../components/AreaDetailsLayout/NaturalArea';
// import { postFarmSiteLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import { locationInfoSelector } from '../../mapSlice';

function NauralAreaDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { grid_points } = useSelector(locationInfoSelector);
  const submitForm = (data) => {
    // dispatch(postFarmSiteLocation(data));
  };
  return (
    <PureNaturalArea
      history={history}
      submitForm={submitForm}
      system={system}
      grid_points={grid_points}
    />
  );
}

export default NauralAreaDetailForm;
