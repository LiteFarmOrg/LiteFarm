import React, { useEffect } from 'react';
import PureGate from '../../../../components/LocationDetailLayout/PointDetails/Gate';
import { editGateLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { gateSelector } from '../../../gateSlice';
import {
  hookFormPersistSelector,
  setAreaDetailFormData,
} from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getFormData, useLocationPageType } from '../../utils';

function EditGateDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    isEditLocationPage &&
      dispatch(editGateLocation({ ...data, ...match.params, figure_id: gate.figure_id }));
  };
  const gate = useSelector(gateSelector(match.params.location_id));
  const formData = useSelector(hookFormPersistSelector);
  useEffect(() => {
    dispatch(setAreaDetailFormData(getFormData(gate)));
  }, []);
  const { isCreateLocationPage, isViewLocationPage, isEditLocationPage } = useLocationPageType(
    match,
  );
  return (
    <PureGate
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

export default EditGateDetailForm;
