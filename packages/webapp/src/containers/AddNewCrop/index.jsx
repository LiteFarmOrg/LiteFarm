import PureAddNewCrop from '../../components/AddNewCrop';
import ImagePickerWrapper from '../ImagePickerWrapper';
import { AddLink } from '../../components/Typography';
import { useTranslation } from 'react-i18next';
import { HookFormPersistProvider } from '../hooks/useHookFormPersist/HookFormPersistProvider';
import { useNavigate } from 'react-router-dom-v5-compat';

function AddNewCrop() {
  let navigate = useNavigate();
  const { t } = useTranslation(['translation']);
  const onError = (error) => {
    console.log(error);
  };

  return (
    <HookFormPersistProvider>
      <PureAddNewCrop
        handleContinue={() => navigate(`/crop/new/add_crop_variety`)}
        handleGoBack={() => navigate(-1)}
        imageUploader={
          <ImagePickerWrapper>
            <AddLink>{t('CROP.ADD_IMAGE')}</AddLink>
          </ImagePickerWrapper>
        }
        handleError={onError}
      />
    </HookFormPersistProvider>
  );
}

export default AddNewCrop;
