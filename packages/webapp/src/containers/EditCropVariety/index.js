import React from 'react';
import PureEditCropVariety from '../../components/EditCropVariety';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
// import { postCropAndVarietal, postVarietal } from './saga';
import { certifierSurveySelector } from '../OrganicCertifierSurvey/slice';
// import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import ImagePickerWrapper from '../ImagePickerWrapper';
import { AddLink } from '../../components/Typography';
import { useTranslation } from 'react-i18next';
import { HookFormPersistProvider } from '../hooks/useHookFormPersist/HookFormPersistProvider';
import { cropVarietySelector } from '../cropVarietySlice';

function EditCropVarietyForm({ history, match }) {
  const { t } = useTranslation(['translation']);
  const dispatch = useDispatch();
  const { variety_id } = match.params;
  const cropVariety = useSelector(cropVarietySelector(variety_id));
  const { interested } = useSelector(certifierSurveySelector, shallowEqual);

  const onError = (error) => {
    console.log(error);
  };

  const onSubmit = (data) => {
    console.log({ data });
    console.log('dispatch patch endpoint');
    // dispatch(postVarietal({ ...cropData, crop_id: Number(crop_id) }));
  };

  return (
    <HookFormPersistProvider>
      <PureEditCropVariety
        onSubmit={onSubmit}
        onError={onError}
        isSeekingCert={interested}
        imageUploader={
          <ImagePickerWrapper>
            <AddLink>{t('CROP.ADD_IMAGE')}</AddLink>
          </ImagePickerWrapper>
        }
        handleGoBack={() => history.push(`/crop/${variety_id}/detail`)}
        cropVariety={cropVariety}
      />
    </HookFormPersistProvider>
  );
}

export default EditCropVarietyForm;
