import React, { useEffect } from 'react';
import PureFarmSiteBoundary from '../../../../components/LocationDetailLayout/AreaDetails/FarmSiteBoundary';
import { editFarmSiteBoundaryLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { farmSiteBoundarySelector } from '../../../farmSiteBoundarySlice';
import {
  hookFormPersistSelector,
  setAreaDetailFormData,
} from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

function EditFarmSiteBoundaryDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    dispatch(editFarmSiteBoundaryLocation({ ...data, ...match.params }));
  };
  const farmSiteBoundary = useSelector(farmSiteBoundarySelector(match.params.location_id));
  const formData = useSelector(hookFormPersistSelector);
  useEffect(() => {
    !formData.name && dispatch(setAreaDetailFormData(farmSiteBoundary));
  }, []);

  return (
    <PureFarmSiteBoundary
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isEditLocationPage
    />
  );
}

export default EditFarmSiteBoundaryDetailForm;
