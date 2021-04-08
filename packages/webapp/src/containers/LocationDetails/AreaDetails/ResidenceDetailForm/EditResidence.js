import React, { useEffect } from 'react';
import PureResidence from '../../../../components/LocationDetailLayout/AreaDetails/Residence';
import { editResidenceLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { residenceSelector } from '../../../residenceSlice';
import {
  hookFormPersistSelector,
  setAreaDetailFormData,
} from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getFormData, useLocationPageType } from '../../utils';

function EditResidenceDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    isEditLocationPage &&
      dispatch(editResidenceLocation({ ...data, ...match.params, figure_id: residence.figure_id }));
  };
  const residence = useSelector(residenceSelector(match.params.location_id));
  const formData = useSelector(hookFormPersistSelector);
  useEffect(() => {
    dispatch(setAreaDetailFormData(getFormData(residence)));
  }, []);
  const { isCreateLocationPage, isViewLocationPage, isEditLocationPage } = useLocationPageType(
    match,
  );
  return (
    <PureResidence
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

export default EditResidenceDetailForm;
