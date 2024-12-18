import PureAddCropVariety from '../../components/AddCropVariety';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { cropSelector } from '../cropSlice';
import { cropVarietiesSelector } from '../cropVarietySlice';
import { postCropAndVarietal, postVarietal } from './saga';
import { certifierSurveySelector } from '../OrganicCertifierSurvey/slice';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import ImagePickerWrapper from '../ImagePickerWrapper';
import { useTranslation } from 'react-i18next';
import { HookFormPersistProvider } from '../hooks/useHookFormPersist/HookFormPersistProvider';
import { AddLink } from '../../components/Typography';
import { useNavigate, useParams } from 'react-router-dom';

function AddCropVarietyForm() {
  let navigate = useNavigate();
  let { crop_id } = useParams();
  const { t } = useTranslation(['translation']);
  const dispatch = useDispatch();
  const existingCropInfo = useSelector(cropSelector(crop_id));
  const { interested } = useSelector(certifierSurveySelector, shallowEqual);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const isNewCrop = crop_id === 'new';
  const crop = isNewCrop ? persistedFormData : existingCropInfo;
  const onError = (error) => {
    console.log(error);
  };
  const onContinue = (data) => {
    navigate(`/crop/${crop_id}/add_crop_variety/compliance`);
  };

  const farmCropVarieties = useSelector(cropVarietiesSelector);

  const onSubmit = (data) => {
    const cropData = {
      ...persistedFormData,
      ...data,
      crop_variety_name: data.crop_variety_name.trim(),
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

  return (
    <HookFormPersistProvider>
      <PureAddCropVariety
        onSubmit={interested ? onContinue : onSubmit}
        onError={onError}
        isSeekingCert={interested}
        crop={crop}
        imageUploader={
          <ImagePickerWrapper>
            <AddLink>{t('CROP.VARIETAL_IMAGE')}</AddLink>
          </ImagePickerWrapper>
        }
        handleGoBack={() => navigate(-1)}
        farmCropVarieties={farmCropVarieties}
      />
    </HookFormPersistProvider>
  );
}

export default AddCropVarietyForm;
