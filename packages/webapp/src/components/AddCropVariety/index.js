import Button from '../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Label } from '../Typography';
import Input from '../Form/Input';
import styles from './styles.module.scss';
import Radio from '../Form/Radio';
import Form from '../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';

export default function PureAddCropVariety({
  match,
  onSubmit,
  onError,
  useHookFormPersist,
  isSeekingCert,
  persistedFormData,
  crop,
  imageUploader,
  handleGoBack,
  handleCancel,
}) {
  const { t } = useTranslation(['translation', 'common', 'crop']);
  const VARIETY = 'crop_variety_name';
  const SUPPLIER = 'supplier';
  const LIFE_CYCLE = 'lifecycle';
  const CROP_VARIETY_PHOTO_URL = 'crop_variety_photo_url';
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: {
      crop_variety_photo_url:
        crop.crop_photo_url ||
        `https://${process.env.REACT_APP_DO_BUCKET_NAME}.nyc3.digitaloceanspaces.com/default_crop/v2/default.webp`,
      [LIFE_CYCLE]: crop[LIFE_CYCLE],
      ...persistedFormData,
    },
  });
  const persistedPath = [`/crop/${match.params.crop_id}/add_crop_variety/compliance`, '/crop/new'];

  useHookFormPersist(getValues, persistedPath);

  const disabled = !isValid;

  const varietyRegister = register(VARIETY, { required: true });
  const supplierRegister = register(SUPPLIER, { required: isSeekingCert ? true : false });
  const lifeCycleRegister = register(LIFE_CYCLE, { required: true });
  const imageUrlRegister = register(CROP_VARIETY_PHOTO_URL, { required: true });

  const crop_variety_photo_url = watch(CROP_VARIETY_PHOTO_URL);
  const cropTranslationKey = crop.crop_translation_key;
  const cropNameLabel = cropTranslationKey
    ? t(`crop:${cropTranslationKey}`)
    : crop.crop_common_name;

  const progress = 33;
  return (
    <Form
      buttonGroup={
        <Button disabled={disabled} fullLength>
          {isSeekingCert ? t('common:CONTINUE') : t('common:SAVE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={handleGoBack}
        onCancel={handleCancel}
        title={t('CROP.ADD_CROP')}
        value={progress}
      />

      <div className={styles.cropLabel}>{cropNameLabel}</div>
      <img
        src={crop_variety_photo_url}
        alt={crop.crop_common_name}
        className={styles.circleImg}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'crop-images/default.jpg';
        }}
      />

      <div
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: '24px',
          display: 'flex',
          width: 'fit-content',
          fontSize: '16px',
          color: 'var(--iconActive)',
          lineHeight: '16px',
          cursor: 'pointer',
        }}
      >
        {React.cloneElement(imageUploader, {
          hookFormRegister: imageUrlRegister,
          uploadDirectory: 'crop_variety/',
        })}
      </div>

      <Input
        style={{ marginBottom: '40px' }}
        label={t('translation:FIELDS.EDIT_FIELD.VARIETY')}
        type="text"
        hookFormRegister={varietyRegister}
        hasLeaf={true}
      />

      <Input
        style={{ marginBottom: '40px' }}
        label={t('CROP_VARIETIES.SUPPLIER')}
        type="text"
        hookFormRegister={supplierRegister}
        hasLeaf={true}
        optional={!isSeekingCert}
      />

      <div>
        <div style={{ marginTop: '16px', marginBottom: '20px' }}>
          <Label
            style={{
              paddingRight: '10px',
              fontSize: '16px',
              lineHeight: '20px',
              display: 'inline-block',
            }}
          >
            {t('CROP.ANNUAL_OR_PERENNIAL')}
          </Label>
        </div>
        <div>
          <Radio label={t('CROP.ANNUAL')} value={'ANNUAL'} hookFormRegister={lifeCycleRegister} />
        </div>
        <div>
          <Radio
            label={t('CROP.PERENNIAL')}
            value={'PERENNIAL'}
            hookFormRegister={lifeCycleRegister}
          />
        </div>
      </div>
    </Form>
  );
}

PureAddCropVariety.prototype = {
  history: PropTypes.object,
  match: PropTypes.object,
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
  useHookFormPersist: PropTypes.func,
  isSeekingCert: PropTypes.bool,
  persistedFormData: PropTypes.object,
  crop: PropTypes.object,
  imageUploader: PropTypes.node,
};
