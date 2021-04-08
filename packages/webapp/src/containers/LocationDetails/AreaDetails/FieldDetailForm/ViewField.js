import React, { useEffect } from 'react';
import PureField from '../../../../components/LocationDetailLayout/AreaDetails/Field';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { fieldSelector } from '../../../fieldSlice';
import { setAreaDetailFormData } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getFormData } from '../../utils';

function ViewFieldDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const field = useSelector(fieldSelector(match.params.location_id));
  useEffect(() => {
    dispatch(setAreaDetailFormData(getFormData(field)));
  }, []);

  return (
    <PureField
      history={history}
      match={match}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isViewLocationPage
    />
  );
}

export default ViewFieldDetailForm;
