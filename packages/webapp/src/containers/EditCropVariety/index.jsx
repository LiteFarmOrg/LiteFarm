import PureEditCropVariety from '../../components/EditCropVariety';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { certifierSurveySelector } from '../OrganicCertifierSurvey/slice';
import ImagePickerWrapper from '../ImagePickerWrapper';
import { AddLink } from '../../components/Typography';
import { useTranslation } from 'react-i18next';
import { cropVarietySelector } from '../cropVarietySlice';
import { patchVarietal } from '../AddCropVariety/saga';
import { useParams } from 'react-router-dom';

function EditCropVarietyForm({ history }) {
  const { t } = useTranslation(['translation']);
  const dispatch = useDispatch();
  const { variety_id } = useParams();
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

  return (
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
    />
  );
}

export default EditCropVarietyForm;
