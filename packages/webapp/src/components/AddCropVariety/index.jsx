import Button from '../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Label, Underlined } from '../Typography';
import Input, { integerOnKeyDown, getInputErrors } from '../Form/Input';
import styles from './styles.module.scss';
import Radio from '../Form/Radio';
import Form from '../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import Infoi from '../Tooltip/Infoi';
import { ReactComponent as ExternalLinkIcon } from '../../assets/images/ExternalLink.svg';
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
}) {
  const { t } = useTranslation(['translation', 'common', 'crop']);
  const COMMON_NAME = 'crop_variety_name';
  const VARIETAL = 'crop_varietal';
  const CULTIVAR = 'crop_cultivar';
  const SUPPLIER = 'supplier';
  const LIFE_CYCLE = 'lifecycle';
  const CROP_VARIETY_PHOTO_URL = 'crop_variety_photo_url';
  const HS_CODE_ID = 'hs_code_id';
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
      crop_variety_photo_url: null,
      [LIFE_CYCLE]: crop[LIFE_CYCLE],
      [HS_CODE_ID]: crop?.[HS_CODE_ID],
      ...persistedFormData,
    },
  });

  const { historyCancel } = useHookFormPersist(getValues);

  const disabled = !isValid;

  const commonNameRegister = register(COMMON_NAME, { required: true });
  const varietalRegister = register(VARIETAL, {
    maxLength: { value: 200, message: t('FORM_VALIDATION.OVER_200_CHARS') },
    required: false,
  });
  const cultivarRegister = register(CULTIVAR, {
    maxLength: { value: 200, message: t('FORM_VALIDATION.OVER_200_CHARS') },
    required: false,
  });
  const supplierRegister = register(SUPPLIER, { required: isSeekingCert ? true : false });
  const lifeCycleRegister = register(LIFE_CYCLE, { required: true });
  const imageUrlRegister = register(CROP_VARIETY_PHOTO_URL, { required: false });
  const crop_variety_photo_url = watch(CROP_VARIETY_PHOTO_URL);
  const cropTranslationKey = crop.crop_translation_key;
  const cropNameLabel = cropTranslationKey
    ? t(`crop:${cropTranslationKey}`)
    : crop.crop_common_name;
  const genusForLabel = () => {
    if (crop.crop_genus) {
      if (crop.crop_genus.length > 22) {
        return crop.crop_genus.slice(0, 22) + '...';
      }

      return crop.crop_genus;
    }

    return '';
  };
  const specieForLabel = () => {
    if (crop.crop_specie) {
      if (crop.crop_specie.length > 22) {
        return crop.crop_specie.slice(0, 22) + '...';
      }

      return crop.crop_specie;
    }

    return '';
  };
  const scientificNameLabel = genusForLabel() + ' ' + specieForLabel();
  const progress = 33;
  const subText = (data) => {
    return (
      <>
        <div style={{ width: 'fit-content', display: 'inline-block', height: '18px' }}>
          {data}
          <Underlined style={{ width: 'fit-content', display: 'inline-block', marginLeft: '3px' }}>
            {' '}
            {t('common:HERE').toLowerCase()}
          </Underlined>
          <ExternalLinkIcon
            style={{ width: '15px', height: '15px', padding: '0px', marginLeft: '2px' }}
          />
        </div>
      </>
    );
  };
  return (
    <Form
      buttonGroup={
        <Button data-cy="variety-submit" disabled={disabled} fullLength>
          {isSeekingCert ? t('common:CONTINUE') : t('common:SAVE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={handleGoBack}
        onCancel={historyCancel}
        title={t('CROP.ADD_CROP')}
        value={progress}
      />

      <div style={{ fontSize: '16px', marginBottom: '20px' }}>
        <p>{t('translation:CROP.VARIETAL_SUBTITLE')}</p>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 'fit-contents', display: 'inline-block', verticalAlign: 'top' }}>
          <img
            src={crop.crop_photo_url}
            alt={crop.crop_common_name}
            className={styles.circleImg}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'crop-images/default.jpg';
            }}
          />
        </div>
        <div
          className="nameLabel"
          style={{ display: 'inline-block', marginLeft: '18px', marginTop: '10px' }}
        >
          <div
            className="cropLabel"
            style={{ weight: '600', fontSize: '18px', marginBottom: '0px' }}
          >
            {cropNameLabel}
          </div>
          <div
            className="scientificNameLabel"
            style={{ verticalAlign: 'top', fontStyle: 'italic', fontSize: '16px', height: '18px' }}
          >
            {scientificNameLabel}
          </div>
        </div>
      </div>
      <Input
        data-cy="crop-commonName"
        style={{ marginBottom: '40px' }}
        label={t('CROP.VARIETY_COMMON_NAME')}
        type="text"
        hookFormRegister={commonNameRegister}
        hasLeaf={false}
      />
      <Input
        data-cy="crop-varietal"
        style={{ marginBottom: '40px' }}
        label={t('CROP.VARIETY_VARIETAL')}
        type="text"
        hookFormRegister={varietalRegister}
        errors={getInputErrors(errors, 'crop_varietal')}
        hasLeaf={false}
        optional
        info={subText(t('CROP.VARIETAL_SUBTEXT'))}
        placeholder={t('CROP.VARIETAL_PLACEHOLDER')}
      />
      <Input
        data-cy="crop-cultivar"
        style={{ marginBottom: '40px' }}
        label={t('CROP.VARIETY_CULTIVAR')}
        type="text"
        hookFormRegister={cultivarRegister}
        errors={getInputErrors(errors, 'crop_cultivar')}
        hasLeaf={false}
        optional
        info={subText(t('CROP.CULTIVAR_SUBTEXT'))}
        placeholder={t('CROP.CULTIVAR_PLACEHOLDER')}
        hideOnFocus
      />
      {crop_variety_photo_url && (
        <img
          src={crop_variety_photo_url}
          alt={crop.crop_common_name}
          className={styles.circleImg}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'crop-images/default.jpg';
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
          targetRoute: 'crop',
        })}
        <Infoi
          style={{
            width: 'fit-content',
            display: 'inline-block',
          }}
          content={t('CROP.VARIETAL_IMAGE_INFO')}
        />
      </div>

      <Input
        data-cy="crop-supplier"
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
      {!isSeekingCert && (
        <Input
          label={t('CROP_DETAIL.HS_CODE')}
          style={{ paddingBottom: '16px', paddingTop: '24px' }}
          hookFormRegister={register(HS_CODE_ID, { valueAsNumber: true })}
          type={'number'}
          onKeyDown={integerOnKeyDown}
          max={9999999999}
          optional
        />
      )}
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
