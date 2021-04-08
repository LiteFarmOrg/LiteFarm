import React, { useEffect } from 'react';
import PureGreenhouse from '../../../../components/LocationDetailLayout/AreaDetails/Greenhouse';
import { editGreenhouseLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { greenhouseSelector } from '../../../greenhouseSlice';
import {
  hookFormPersistSelector,
  setAreaDetailFormData,
} from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getFormData } from '../../utils';

function EditGreenhouseDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    dispatch(editGreenhouseLocation({ ...data, ...match.params }));
  };
  const greenhouse = useSelector(greenhouseSelector(match.params.location_id));
  const formData = useSelector(hookFormPersistSelector);
  useEffect(() => {
    !formData.name && dispatch(setAreaDetailFormData(getFormData(greenhouse)));
  }, []);

  return (
    <PureGreenhouse
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isEditLocationPage
    />
  );
}

export default EditGreenhouseDetailForm;
