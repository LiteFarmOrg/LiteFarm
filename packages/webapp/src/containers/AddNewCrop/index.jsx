import { useHistory } from 'react-router-dom';
import PureAddNewCrop from '../../components/AddNewCrop';
import ImagePickerWrapper from '../ImagePickerWrapper';
import { AddLink } from '../../components/Typography';
import { useTranslation } from 'react-i18next';
import { HookFormPersistProvider } from '../hooks/useHookFormPersist/HookFormPersistProvider';

function AddNewCrop() {
  const history = useHistory();
  const { t } = useTranslation(['translation']);
  const onError = (error) => {
    console.log(error);
  };

  return (
    <HookFormPersistProvider>
      <PureAddNewCrop
        handleContinue={() => history.push(`/crop/new/add_crop_variety`)}
        handleGoBack={() => history.back()}
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
