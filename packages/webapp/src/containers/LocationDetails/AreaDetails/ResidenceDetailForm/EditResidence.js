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
import { getFormData } from '../../utils';

function EditResidenceDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    dispatch(editResidenceLocation({ ...data, ...match.params }));
  };
  const residence = useSelector(residenceSelector(match.params.location_id));
  const formData = useSelector(hookFormPersistSelector);
  useEffect(() => {
    !formData.name && dispatch(setAreaDetailFormData(getFormData(residence)));
  }, []);

  return (
    <PureResidence
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isEditLocationPage
    />
  );
}

export default EditResidenceDetailForm;
