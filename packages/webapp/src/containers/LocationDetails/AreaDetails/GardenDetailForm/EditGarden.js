import React, { useEffect } from 'react';
import PureGarden from '../../../../components/LocationDetailLayout/AreaDetails/Garden';
import { editGardenLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { gardenSelector } from '../../../gardenSlice';
import {
  hookFormPersistSelector,
  setAreaDetailFormData,
} from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getFormData } from '../../utils';

function EditGardenDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    dispatch(editGardenLocation({ ...data, ...match.params }));
  };
  const garden = useSelector(gardenSelector(match.params.location_id));
  const formData = useSelector(hookFormPersistSelector);
  useEffect(() => {
    !formData.name && dispatch(setAreaDetailFormData(getFormData(garden)));
  }, []);

  return (
    <PureGarden
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isEditLocationPage
    />
  );
}

export default EditGardenDetailForm;
