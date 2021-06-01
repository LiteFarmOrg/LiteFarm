import React from 'react';
import ComplianceInfo from '../../components/AddCropVariety/ComplianceInfo';
import { useDispatch, useSelector } from 'react-redux';
import { postCropAndVarietal, postVarietal } from './saga';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../hooks/useHookFormPersist';

function ComplianceInfoForm({ history, match }) {
  const dispatch = useDispatch();
  const persistedFormData = useSelector(hookFormPersistSelector);

  //TODO: create two different route for creating crop / crop_variety
  const crop_id = match.params.crop_id;
  const isNewCrop = crop_id === 'new';

  const onError = (err) => {
    console.log(err);
  };

  const onSubmit = (data) => {
    const cropData = {
      ...persistedFormData,
      ...data,
      compliance_file_url: '',
    };
    if (isNewCrop) {
      dispatch(postCropAndVarietal(cropData));
    } else {
      dispatch(postVarietal({ ...cropData, crop_id: Number(crop_id) }));
    }
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
