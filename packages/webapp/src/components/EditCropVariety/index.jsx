import Button from '../Form/Button';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Label } from '../Typography';
import Input, { getInputErrors, integerOnKeyDown } from '../Form/Input';
import styles from './styles.module.scss';
import Radio from '../Form/Radio';
import Form from '../Form';
import { useForm } from 'react-hook-form';
import PageTitle from '../PageTitle/v2';
import RadioGroup from '../Form/RadioGroup';
import Infoi from '../Tooltip/Infoi';
import Leaf from '../../assets/images/farmMapFilter/Leaf.svg?react';
import Spinner from '../Spinner';

const FIELD_NAMES = {
  COMMON_NAME: 'crop_variety_name',
  VARIETAL: 'crop_varietal',
  CULTIVAR: 'crop_cultivar',
  SUPPLIER: 'supplier',
  LIFE_CYCLE: 'lifecycle',
  CROP_VARIETY_PHOTO_URL: 'crop_variety_photo_url',
  CERTIFIED_ORGANIC: 'organic',
  COMMERCIAL_AVAILABILITY: 'searched',
  GENETICALLY_ENGINEERED: 'genetically_engineered',
  TREATED: 'treated',
  HS_CODE_ID: 'hs_code_id',
};

export default function PureEditCropVariety({
  onSubmit,
  onError,
  isSeekingCert,
  imageUploader,
  handleGoBack,
  cropVariety,
}) {
  const { t } = useTranslation(['translation', 'common', 'crop']);
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: {
      ...Object.values(FIELD_NAMES).reduce((values, fieldName) => {
        values[fieldName] = cropVariety[fieldName];
        return values;
      }, {}),
      [FIELD_NAMES.CROP_VARIETY_PHOTO_URL]:
        cropVariety[FIELD_NAMES.CROP_VARIETY_PHOTO_URL] ||
        cropVariety.crop_photo_url ||
        `https://${
          import.meta.env.VITE_DO_BUCKET_NAME
        }.nyc3.digitaloceanspaces.com//default_crop/v2/default.webp`,
    },
  });

  const disabled = !isValid;

  const commonNameRegister = register(FIELD_NAMES.COMMON_NAME, { required: true });
  const supplierRegister = register(FIELD_NAMES.SUPPLIER, {
    required: isSeekingCert ? true : false,
  });
  const lifeCycleRegister = register(FIELD_NAMES.LIFE_CYCLE, { required: true });
  const imageUrlRegister = register(FIELD_NAMES.CROP_VARIETY_PHOTO_URL, { required: true });
  const varietalRegister = register(FIELD_NAMES.VARIETAL, {
    maxLength: { value: 255, message: t('FORM_VALIDATION.OVER_255_CHARS') },
    required: false,
  });
  const cultivarRegister = register(FIELD_NAMES.CULTIVAR, {
    maxLength: { value: 255, message: t('FORM_VALIDATION.OVER_255_CHARS') },
    required: false,
  });

  const crop_variety_photo_url = watch(FIELD_NAMES.CROP_VARIETY_PHOTO_URL);
  const organic = watch(FIELD_NAMES.CERTIFIED_ORGANIC);
  const cropTranslationKey = cropVariety.crop_translation_key;
  const cropNameLabel = cropTranslationKey
    ? t(`crop:${cropTranslationKey}`)
    : cropVariety.crop_common_name;

  const [showSpinner, setShowSpinner] = useState(false);

  return (
    <Form
      buttonGroup={
        <Button disabled={disabled} fullLength>
          {t('common:UPDATE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <PageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={handleGoBack}
        title={t('CROP.EDIT_CROP')}
      />

      <div className={styles.cropLabel}>{cropNameLabel}</div>

      {showSpinner ? (
        <div style={{ height: 'fit-content' }}>
          <Spinner />
        </div>
      ) : (
        <img
          src={crop_variety_photo_url}
          alt={cropVariety.crop_common_name}
          className={styles.circleImg}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/crop-images/default.jpg';
          }}
        />
      )}

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
          targetRoute: 'crop_variety',
          onLoading: setShowSpinner,
        })}
      </div>

      <Input
        style={{ marginBottom: '40px' }}
        label={t('CROP.VARIETY_COMMON_NAME')}
        hookFormRegister={commonNameRegister}
        errors={getInputErrors(errors, FIELD_NAMES.COMMON_NAME)}
      />
      <Input
        style={{ marginBottom: '40px' }}
        label={t('CROP.VARIETY_VARIETAL')}
        hookFormRegister={varietalRegister}
        errors={getInputErrors(errors, FIELD_NAMES.VARIETAL)}
        optional
        textWithExternalLink={t('CROP.VARIETAL_SUBTEXT')}
        link={'https://www.litefarm.org/post/cultivars-and-varietals'}
        placeholder={t('CROP.VARIETAL_PLACEHOLDER')}
      />
      <Input
        style={{ marginBottom: '40px' }}
        label={t('CROP.VARIETY_CULTIVAR')}
        hookFormRegister={cultivarRegister}
        errors={getInputErrors(errors, FIELD_NAMES.CULTIVAR)}
        optional
        textWithExternalLink={t('CROP.CULTIVAR_SUBTEXT')}
        link={'https://www.litefarm.org/post/cultivars-and-varietals'}
        placeholder={t('CROP.CULTIVAR_PLACEHOLDER')}
      />
      <Input
        style={{ marginBottom: '40px' }}
        label={t('translation:FIELDS.EDIT_FIELD.SUPPLIER')}
        type="text"
        hookFormRegister={supplierRegister}
        hasLeaf={true}
        optional={!isSeekingCert}
      />

      <div style={{ marginBottom: '20px' }}>
        <Label className={styles.label}>{t('CROP.ANNUAL_OR_PERENNIAL')}</Label>
      </div>
      <div
        style={{
          display: 'flex',
          columnGap: '28px',
          flexDirection: 'column',
          marginBottom: '16px',
        }}
      >
        <Radio label={t('CROP.ANNUAL')} value={'ANNUAL'} hookFormRegister={lifeCycleRegister} />
        <Radio
          label={t('CROP.PERENNIAL')}
          value={'PERENNIAL'}
          hookFormRegister={lifeCycleRegister}
        />
      </div>

      {isSeekingCert && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <Label className={styles.label}>{t('CROP.IS_ORGANIC')}</Label>
            <Leaf alt={'organic-leaf'} style={{ display: 'inline-block' }} />
          </div>
          <RadioGroup
            style={{ marginBottom: '16px' }}
            hookFormControl={control}
            name={FIELD_NAMES.CERTIFIED_ORGANIC}
            required
          />
          {organic === false && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <Label className={styles.label}>
                  {t('CROP.PERFORM_SEARCH')}
                  {
                    <Leaf
                      alt={'organic-leaf'}
                      style={{ marginLeft: '10px', display: 'inline-block' }}
                    />
                  }
                  {
                    <Infoi
                      style={{ marginLeft: '8px' }}
                      content={t('CROP.NEED_DOCUMENT_PERFORM_SEARCH')}
                    />
                  }
                </Label>
              </div>
              <RadioGroup
                style={{ marginBottom: '16px' }}
                hookFormControl={control}
                name={FIELD_NAMES.COMMERCIAL_AVAILABILITY}
                required
              />
              <div style={{ marginBottom: '16px' }}>
                <Label className={styles.label}>{t('CROP.IS_GENETICALLY_ENGINEERED')}</Label>
                <Leaf alt={'organic-leaf'} style={{ display: 'inline-block' }} />
                <Infoi
                  style={{ marginLeft: '8px' }}
                  content={t('CROP.NEED_DOCUMENT_GENETICALLY_ENGINEERED')}
                />
              </div>
              <RadioGroup
                style={{ marginBottom: '16px' }}
                hookFormControl={control}
                name={FIELD_NAMES.GENETICALLY_ENGINEERED}
                required
              />

              <div style={{ marginBottom: '16px' }}>
                <Label className={styles.label}>{t('CROP.TREATED')}</Label>
                <Leaf alt={'organic-leaf'} style={{ display: 'inline-block' }} />
                <Infoi style={{ marginLeft: '8px' }} content={t('CROP.NEED_DOCUMENT_TREATED')} />
              </div>

              <RadioGroup
                hookFormControl={control}
                name={FIELD_NAMES.TREATED}
                required
                showNotSure
              />
            </>
          )}
          {organic === true && (
            <div>
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <Label className={styles.label}>{t('CROP.TREATED')}</Label>
                  <Leaf alt={'organic-leaf'} style={{ display: 'inline-block' }} />
                  <Infoi style={{ marginLeft: '8px' }} content={t('CROP.NEED_DOCUMENT_TREATED')} />
                </div>
              </div>
              <RadioGroup
                hookFormControl={control}
                name={FIELD_NAMES.TREATED}
                required
                showNotSure
              />
            </div>
          )}
        </>
      )}
      <Input
        label={t('CROP_DETAIL.HS_CODE')}
        style={{ paddingBottom: '16px', paddingTop: '24px' }}
        hookFormRegister={register(FIELD_NAMES.HS_CODE_ID, {
          valueAsNumber: true,
        })}
        type={'number'}
        onKeyDown={integerOnKeyDown}
        max={9999999999}
        optional
      />
    </Form>
  );
}

PureEditCropVariety.prototype = {
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
