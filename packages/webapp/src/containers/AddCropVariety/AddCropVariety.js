import React from 'react';
import PureAddCropVariety from '../../components/AddCropVariety';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { cropSelector } from '../cropSlice';
import { postCropAndVarietal, postVarietal } from './saga';
import { certifierSurveySelector } from '../OrganicCertifierSurvey/slice';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import ImagePickerWrapper from '../ImagePickerWrapper';
import { AddLink } from '../../components/Typography';
import { useTranslation } from 'react-i18next';
import { HookFormPersistProvider } from '../hooks/useHookFormPersist/HookFormPersistProvider';

function AddCropVarietyForm({ history, match }) {
  const { t } = useTranslation(['translation']);
  const dispatch = useDispatch();
  const crop_id = match.params.crop_id;
  const existingCropInfo = useSelector(cropSelector(crop_id));
  const { interested } = useSelector(certifierSurveySelector, shallowEqual);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const isNewCrop = crop_id === 'new';
  const crop = isNewCrop ? persistedFormData : existingCropInfo;
  const onError = (error) => {
    console.log(error);
  };
  const onContinue = (data) => {
    history.push(`/crop/${crop_id}/add_crop_variety/compliance`);
  };

  const onSubmit = (data) => {
    const cropData = {
      ...persistedFormData,
      ...data,
      compliance_file_url: '',
      organic: null,
      treated: null,
      genetically_engineered: null,
      searched: null,
    };
    if (isNewCrop) {
      dispatch(postCropAndVarietal(cropData));
    } else {
      dispatch(postVarietal({ ...cropData, crop_id: Number(crop_id) }));
    }
  };

  return (
    <HookFormPersistProvider>
      <PureAddCropVariety
        match={match}
        onSubmit={interested ? onContinue : onSubmit}
        onError={onError}
        isSeekingCert={interested}
        crop={crop}
        imageUploader={
          <ImagePickerWrapper>
            <AddLink>{t('CROP.ADD_IMAGE')}</AddLink>
          </ImagePickerWrapper>
        }
        handleGoBack={() => history.push(isNewCrop ? `/crop/new` : `/crop_catalogue`)}
        handleCancel={() => history.push(`/crop_catalogue`)}
      />
    </HookFormPersistProvider>
  );
}

export default AddCropVarietyForm;
