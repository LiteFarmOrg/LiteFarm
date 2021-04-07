import React, { useEffect } from 'react';
import PureGreenhouse from '../../../../components/LocationDetailLayout/AreaDetails/Greenhouse';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { greenhouseSelector } from '../../../greenhouseSlice';
import { setAreaDetailFormData } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

function ViewGreenhouseDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const greenhouse = useSelector(greenhouseSelector(match.params.location_id));
  useEffect(() => {
    dispatch(setAreaDetailFormData(greenhouse));
  }, []);

  return (
    <PureGreenhouse
      history={history}
      match={match}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isViewLocationPage
    />
  );
}

export default ViewGreenhouseDetailForm;
