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
import { patchVarietal } from '../AddCropVariety/saga';

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
    const varietyData = {
      organic: null,
      genetically_engineered: null,
      searched: null,
      treated: null,
      ...data,
    };
    dispatch(patchVarietal({ variety_id, crop_id: cropVariety.crop_id, data: varietyData }));
  };

  // TODO - Add persisted path (LF-1430)
  const persistedPath = [];

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
        handleGoBack={() => history.back()}
        cropVariety={cropVariety}
        persistedPath={persistedPath}
      />
    </HookFormPersistProvider>
  );
}

export default EditCropVarietyForm;
