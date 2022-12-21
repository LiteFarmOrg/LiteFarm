import Button from '../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Label } from '../Typography';
import Input, { integerOnKeyDown } from '../Form/Input';
import styles from './styles.module.scss';
import Radio from '../Form/Radio';
import Form from '../Form';
import { useForm } from 'react-hook-form';
import PageTitle from '../PageTitle/v2';
import RadioGroup from '../Form/RadioGroup';
import Infoi from '../Tooltip/Infoi';
import Leaf from '../../assets/images/farmMapFilter/Leaf.svg';

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
      crop_variety_photo_url:
        cropVariety.crop_variety_photo_url ||
        cropVariety.crop_photo_url`https://${
          import.meta.env.VITE_DO_BUCKET_NAME
        }.nyc3.digitaloceanspaces.com//default_crop/v2/default.webp`,
      ...(({
        crop_variety_name,
        supplier,
        lifecycle,
        organic,
        treated,
        genetically_engineered,
        searched,
        hs_code_id,
      }) => ({
        crop_variety_name,
        supplier,
        lifecycle,
        organic,
        treated,
        genetically_engineered,
        searched,
        hs_code_id,
      }))(cropVariety),
    },
  });

  const VARIETY = 'crop_variety_name';
  const SUPPLIER = 'supplier';
  const LIFE_CYCLE = 'lifecycle';
  const CROP_VARIETY_PHOTO_URL = 'crop_variety_photo_url';

  const CERTIFIED_ORGANIC = 'organic';
  const COMMERCIAL_AVAILABILITY = 'searched';
  const GENETIC_EGINEERED = 'genetically_engineered';
  const TREATED = 'treated';
  const HS_CODE_ID = 'hs_code_id';

  const disabled = !isValid;

  const varietyRegister = register(VARIETY, { required: true });
  const supplierRegister = register(SUPPLIER, { required: isSeekingCert ? true : false });
  const lifeCycleRegister = register(LIFE_CYCLE, { required: true });
  const imageUrlRegister = register(CROP_VARIETY_PHOTO_URL, { required: true });

  const crop_variety_photo_url = watch(CROP_VARIETY_PHOTO_URL);
  const organic = watch(CERTIFIED_ORGANIC);
  const cropTranslationKey = cropVariety.crop_translation_key;
  const cropNameLabel = cropTranslationKey
    ? t(`crop:${cropTranslationKey}`)
    : cropVariety.crop_common_name;

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
      <img
        src={crop_variety_photo_url}
        alt={cropVariety.crop_common_name}
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
          targetRoute: 'crop_variety',
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
            <img src={Leaf} alt={'organic-leaf'} style={{ display: 'inline-block' }} />
          </div>
          <RadioGroup
            style={{ marginBottom: '16px' }}
            hookFormControl={control}
            name={CERTIFIED_ORGANIC}
            required
          />
          {organic === false && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <Label className={styles.label}>
                  {t('CROP.PERFORM_SEARCH')}
                  {
                    <img
                      src={Leaf}
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
                name={COMMERCIAL_AVAILABILITY}
                required
              />
              <div style={{ marginBottom: '16px' }}>
                <Label className={styles.label}>{t('CROP.IS_GENETICALLY_ENGINEERED')}</Label>
                <img src={Leaf} alt={'organic-leaf'} style={{ display: 'inline-block' }} />
                <Infoi
                  style={{ marginLeft: '8px' }}
                  content={t('CROP.NEED_DOCUMENT_GENETICALLY_ENGINEERED')}
                />
              </div>
              <RadioGroup
                style={{ marginBottom: '16px' }}
                hookFormControl={control}
                name={GENETIC_EGINEERED}
                required
              />

              <div style={{ marginBottom: '16px' }}>
                <Label className={styles.label}>{t('CROP.TREATED')}</Label>
                <img src={Leaf} alt={'organic-leaf'} style={{ display: 'inline-block' }} />
                <Infoi style={{ marginLeft: '8px' }} content={t('CROP.NEED_DOCUMENT_TREATED')} />
              </div>

              <RadioGroup hookFormControl={control} name={TREATED} required showNotSure />
            </>
          )}
          {organic === true && (
            <div>
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <Label className={styles.label}>{t('CROP.TREATED')}</Label>
                  <img src={Leaf} alt={'organic-leaf'} style={{ display: 'inline-block' }} />
                  <Infoi style={{ marginLeft: '8px' }} content={t('CROP.NEED_DOCUMENT_TREATED')} />
                </div>
              </div>
              <RadioGroup hookFormControl={control} name={TREATED} required showNotSure />
            </div>
          )}
        </>
      )}
      <Input
        label={t('CROP_DETAIL.HS_CODE')}
        style={{ paddingBottom: '16px', paddingTop: '24px' }}
        hookFormRegister={register(HS_CODE_ID, {
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
