import React from 'react';
import PureGarden from '../../../components/AreaDetailsLayout/Garden';
import { postGardenLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { gardenEnum } from '../../gardenSlice';
import { measurementSelector } from '../../userFarmSlice';
import { locationInfoSelector } from '../../mapSlice';

function GardenDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { grid_points } = useSelector(locationInfoSelector);
  const submitForm = (data) => {
    dispatch(postGardenLocation(data));
  };

  return (
    <PureGarden
      history={history}
      submitForm={submitForm}
      areaType={gardenEnum}
      system={system}
      grid_points={grid_points}
    />
  );
}

export default GardenDetailForm;
