import React from 'react';
import PureBarn from '../../../components/AreaDetailsLayout/Barn';
import { postBarnLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../userFarmSlice';
import { locationInfoSelector } from '../../mapSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';

function BarnDetailForm({ history }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { area, perimeter, grid_points } = useSelector(locationInfoSelector);
  const submitForm = (data) => {
    dispatch(postBarnLocation(data));
  };

  return (
    <PureBarn
      history={history}
      submitForm={submitForm}
      system={system}
      grid_points={grid_points}
      useHookFormPersist={useHookFormPersist}
      area={area}
      perimeter={perimeter}
    />
  );
}

export default BarnDetailForm;
