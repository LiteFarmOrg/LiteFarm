import React, { useEffect } from 'react';
import PureGarden from '../../../../components/LocationDetailLayout/AreaDetails/Garden';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { gardenSelector } from '../../../gardenSlice';
import { setAreaDetailFormData } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getFormData } from '../../utils';

function ViewGardenDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const garden = useSelector(gardenSelector(match.params.location_id));
  useEffect(() => {
    dispatch(setAreaDetailFormData(getFormData(garden)));
  }, []);

  return (
    <PureGarden
      history={history}
      match={match}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isViewLocationPage
    />
  );
}

export default ViewGardenDetailForm;
