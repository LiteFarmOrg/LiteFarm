import React, { useEffect } from 'react';
import PureBufferZone from '../../../../components/LocationDetailLayout/LineDetails/BufferZone';
import { editBufferZoneLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { bufferZoneSelector } from '../../../bufferZoneSlice';
import {
  hookFormPersistSelector,
  setLineDetailFormData,
} from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getFormData, useLocationPageType } from '../../utils';

function EditBufferZoneDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    isEditLocationPage && dispatch(editBufferZoneLocation({ ...data, ...match.params }));
  };
  const bufferZone = useSelector(bufferZoneSelector(match.params.location_id));
  const formData = useSelector(hookFormPersistSelector);
  useEffect(() => {
    !formData.name && dispatch(setLineDetailFormData(getFormData(bufferZone)));
  }, []);
  const { isCreateLocationPage, isViewLocationPage, isEditLocationPage } = useLocationPageType(
    match,
  );
  return (
    <PureBufferZone
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

export default EditBufferZoneDetailForm;
