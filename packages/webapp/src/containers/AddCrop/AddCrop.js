import React from 'react';
import PureAddCrop from '../../components/AddCrop';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { cropSelector } from '../cropSlice';
import { postVarietal } from './saga';
import useHookFormPersist from '../hooks/useHookFormPersist';
import { certifierSurveySelector } from '../OrganicCertifierSurvey/slice';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import ImagePickerWrapper from '../ImagePickerWrapper';
import { AddLink } from '../../components/Typography';
import { useTranslation } from 'react-i18next';

function AddCropForm({ history, match }) {
  const { t } = useTranslation(['translation']);
  const dispatch = useDispatch();
  const crop_id = match.params.crop_id;
  const crop = useSelector(cropSelector(crop_id));
  const { interested } = useSelector(certifierSurveySelector, shallowEqual);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const onError = (error) => {
    console.log(error);
  };
  const onContinue = (data) => {
    history.push(`/crop/${crop_id}/add_crop_variety/compliance`);
  };

  const onSubmit = (data) => {
    const newVarietal = {
      ...data,
      crop_id: Number(crop_id),
      compliance_file_url: '',
      organic: null,
      treated: null,
      genetically_engineered: null,
      searched: null,
    };
    dispatch(postVarietal(newVarietal));
  };

  return (
    <>
      <PureAddCrop
        history={history}
        match={match}
        onSubmit={interested ? onContinue : onSubmit}
        onError={onError}
        useHookFormPersist={useHookFormPersist}
        isSeekingCert={interested}
        persistedFormData={persistedFormData}
        crop={crop}
        imageUploader={
          <ImagePickerWrapper>
            {' '}
            <AddLink>{t('CROP.ADD_IMAGE')}</AddLink>
          </ImagePickerWrapper>
        }
      />
    </>
  );
}

export default AddCropForm;
