import React from 'react';
import PureNaturalArea from '../../../components/AreaDetailsLayout/NaturalArea';
import { postNaturalAreaLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import { locationInfoSelector } from '../../mapSlice';

function NauralAreaDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { area, perimeter, grid_points } = useSelector(locationInfoSelector);
  const submitForm = (data) => {
    dispatch(postNaturalAreaLocation(data));
  };
  return (
    <PureNaturalArea
      history={history}
      submitForm={submitForm}
      system={system}
      grid_points={grid_points}
      area={area}
      perimeter={perimeter}
    />
  );
}

export default NauralAreaDetailForm;
