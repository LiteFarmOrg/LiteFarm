import Button from '../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Label } from '../Typography';
import Input from '../Form/Input';
import PageTitle from '../PageTitle/v2';
import styles from './styles.module.scss';
import ProgressBar from '../../components/ProgressBar';
import Radio from '../Form/Radio';
import Form from '../Form';
import { useForm } from 'react-hook-form';

export default function PureAddCrop({
  history,
  match,
  onSubmit,
  onError,
  useHookFormPersist,
  isSeekingCert,
  persistedFormData,
  crop,
  imageUploader,
}) {
  const { t } = useTranslation(['translation', 'common', 'crop']);
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: { ...persistedFormData, crop_variety_photo_url: crop.crop_photo_url },
  });
  const persistedPath = [`/crop/${match.params.crop_id}/add_crop_variety/compliance`];

  useHookFormPersist(persistedPath, getValues);

  const VARIETY = 'crop_variety_name';
  const SUPPLIER = 'supplier';
  const SEED_TYPE = 'seeding_type';
  const LIFE_CYCLE = 'lifecycle';
  const CROP_VARIETY_PHOTO_URL = 'crop_variety_photo_url';

  const disabled = !isValid;

  const varietyRegister = register(VARIETY, { required: true });
  const supplierRegister = register(SUPPLIER, { required: true });
  const seedTypeRegister = register(SEED_TYPE, { required: true });
  const lifeCycleRegister = register(LIFE_CYCLE, { required: true });
  const imageUrlRegister = register(CROP_VARIETY_PHOTO_URL, { required: true });

  const crop_variety_photo_url = watch(CROP_VARIETY_PHOTO_URL);

  const progress = 33;
  return (
    <Form
      buttonGroup={
        <Button disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <PageTitle
        onGoBack={() => history.push(`/crop_catalogue`)}
        onCancel={() => history.push(`/crop_catalogue`)}
        title={t('CROP.ADD_CROP')}
      />
      <div
        style={{
          marginBottom: '24px',
          marginTop: '8px',
        }}
      >
        <ProgressBar value={progress} />
      </div>
      <div className={styles.cropLabel}>{t(`crop:${crop.crop_translation_key}`)}</div>
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
        label={'Supplier'}
        type="text"
        hookFormRegister={supplierRegister}
        hasLeaf={true}
        optional={!isSeekingCert}
      />

      <div>
        <div style={{ marginBottom: '24px' }}>
          <Label
            style={{
              paddingRight: '10px',
              fontSize: '16px',
              lineHeight: '20px',
              display: 'inline-block',
            }}
          >
            {t('CROP.SEED_OR_SEEDLING')}
          </Label>
        </div>
        <div>
          <Radio label={t('CROP.SEED')} value={'SEED'} hookFormRegister={seedTypeRegister} />
        </div>
        <div>
          <Radio
            label={t('CROP.SEEDLING_OR_PLANTING_STOCK')}
            value={'SEEDLING_OR_PLANTING_STOCK'}
            hookFormRegister={seedTypeRegister}
          />
        </div>
      </div>

      <div>
        <div style={{ marginBottom: '20px' }}>
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

PureAddCrop.prototype = {
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
