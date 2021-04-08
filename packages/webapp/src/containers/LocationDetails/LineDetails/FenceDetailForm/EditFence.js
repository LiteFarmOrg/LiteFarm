import React, { useEffect } from 'react';
import PureFence from '../../../../components/LocationDetailLayout/LineDetails/Fence';
import { editFenceLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { fenceSelector } from '../../../fenceSlice';
import {
  hookFormPersistSelector,
  setLineDetailFormData,
} from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getFormData, useLocationPageType } from '../../utils';

function EditFenceDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    isEditLocationPage &&
      dispatch(editFenceLocation({ ...data, ...match.params, figure_id: fence.figure_id }));
  };
  const fence = useSelector(fenceSelector(match.params.location_id));
  const formData = useSelector(hookFormPersistSelector);
  useEffect(() => {
    dispatch(setLineDetailFormData(getFormData(fence)));
  }, []);
  const { isCreateLocationPage, isViewLocationPage, isEditLocationPage } = useLocationPageType(
    match,
  );
  return (
    <PureFence
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isEditLocationPage={isEditLocationPage}
      isViewLocationPage={isViewLocationPage}
    />
  );
}

export default EditFenceDetailForm;
