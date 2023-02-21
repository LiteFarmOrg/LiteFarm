import React from 'react';
import PureAddCropVariety from '../../components/AddCropVariety';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { cropSelector } from '../cropSlice';
import { postCropAndVarietal, postVarietal } from './saga';
import { certifierSurveySelector } from '../OrganicCertifierSurvey/slice';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import ImagePickerWrapper from '../ImagePickerWrapper';
import { useTranslation } from 'react-i18next';
import { HookFormPersistProvider } from '../hooks/useHookFormPersist/HookFormPersistProvider';
import { AddLink } from '../../components/Typography';

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
      crop_variety_name: data.crop_variety_name.trim(),
      crop_varietal: data.crop_varietal.trim(),
      crop_cultivar: data.crop_cultivar.trim(),
      crop_variety_photo_url: data.crop_variety_photo_url
        ? data.crop_variety_photo_url
        : `https://${
            import.meta.env.VITE_DO_BUCKET_NAME
          }.nyc3.digitaloceanspaces.com/default_crop/v2/default.webp`,
      supplier: data.supplier.trim(),
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
  const pickerOpts = {
    types: [
      {
        description: 'Images',
        accept: {
          'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
        },
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false,
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
            <AddLink>{t('CROP.VARIETAL_IMAGE')}</AddLink>
          </ImagePickerWrapper>
        }
        handleGoBack={() => history.back()}
      />
    </HookFormPersistProvider>
  );
}

export default AddCropVarietyForm;
