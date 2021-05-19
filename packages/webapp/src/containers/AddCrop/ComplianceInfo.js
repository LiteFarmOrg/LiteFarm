import React from 'react';
import ComplianceInfo from '../../components/AddCrop/ComplianceInfo';
import { useDispatch, useSelector } from 'react-redux';
import { postVarietal } from './saga';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../hooks/useHookFormPersist';

function ComplianceInfoForm({ history, match }) {
  const dispatch = useDispatch();
  const persistedFormData = useSelector(hookFormPersistSelector);

  const crop_id = match.params.crop_id;

  const onError = (err) => {
    console.log(err);
  };

  const onSubmit = (data) => {
    const newVarietal = {
      ...persistedFormData,
      ...data,
      crop_id: Number(crop_id),
      compliance_file_url: '',
    };
    dispatch(postVarietal(newVarietal));
  };

  const onGoBack = () => {
    history.push(`/crop/${crop_id}/add_crop_variety`);
  };

  const onCancel = () => {
    history.push(`/crop_catalogue`);
  };

  return (
    <>
      <ComplianceInfo
        history={history}
        onSubmit={onSubmit}
        onError={onError}
        onGoBack={onGoBack}
        onCancel={onCancel}
        match={match}
        persistedFormData={persistedFormData}
        useHookFormPersist={useHookFormPersist}
      />
    </>
  );
}

export default ComplianceInfoForm;
