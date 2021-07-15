import Button from '../../Form/Button';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Label, Main } from '../../Typography';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import RadioGroup from '../../Form/RadioGroup';
import styles from './styles.module.scss';
import { ReactComponent as Individual } from '../../../assets/images/plantingMethod/Individual.svg';
import { ReactComponent as Rows } from '../../../assets/images/plantingMethod/Rows.svg';
import { ReactComponent as Beds } from '../../../assets/images/plantingMethod/Beds.svg';
import { ReactComponent as Monocrop } from '../../../assets/images/plantingMethod/Monocrop.svg';
import { DO_CDN_URL } from '../../../util/constants';
import ImageModal from '../../Modals/ImageModal';

const CONTAINER = 'CONTAINER';
const BEDS = 'BEDS';
const ROWS = 'ROWS';
const images = {
  [CONTAINER]: [
    `${DO_CDN_URL}/planting_method/Individual_1.jpg`,
    `${DO_CDN_URL}/planting_method/Individual_2.jpg`,
    `${DO_CDN_URL}/planting_method/Individual_3.jpg`,
  ],
  [BEDS]: [
    `${DO_CDN_URL}/planting_method/Bed_1.jpg`,
    `${DO_CDN_URL}/planting_method/Bed_2.jpg`,
    `${DO_CDN_URL}/planting_method/Bed_3.jpg`,
  ],
  [ROWS]: [
    `${DO_CDN_URL}/planting_method/Rows_1.jpg`,
    `${DO_CDN_URL}/planting_method/Rows_2.jpg`,
    `${DO_CDN_URL}/planting_method/Rows_3.jpg`,
  ],
};

export default function PureInGroundTransplant({
  onCancel,
  onGoBack,
  onContinue,
  useHookFormPersist,
  persistedFormData,
}) {
  const { t } = useTranslation();


  const progress = 54;


  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
  });

  const pathsToPersist = [CONTAINER, BEDS, ROWS].map(
    (plantingType) => `/crop/${variety_id}/add_management_plan/${plantingType?.toLowerCase()}`,
  );
  pathsToPersist.push(`/crop/${variety_id}/add_management_plan/choose_transplant_location`);

  useHookFormPersist([...pathsToPersist], getValues);

  const PLANTING_TYPE = 'planting_type';
  const planting_type = watch(PLANTING_TYPE);

  const KNOWS_HOW = 'knows_how_is_crop_planted';
  const knows_how = watch(KNOWS_HOW);

  const [{ imageModalSrc, imageModalAlt }, setSelectedImage] = useState({});
  const onImageSelect = (src, alt) => setSelectedImage({ imageModalSrc: src, imageModalAlt: alt });
  const dismissModal = () => setSelectedImage({});

  const disabled = !isValid;

  const seed_type = persistedFormData.seed_type === 'seed' ? 'seeding' : 'planting';


  return (
    <Form
      buttonGroup={
        <Button disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onContinue)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={progress}
        style={{
          marginBottom: '24px',
        }}
      />
      <div>
        <Label style={{ marginBottom: '18px' }}>
          {t('MANAGEMENT_PLAN.KNOW_HOW_IS_CROP_PLANTED')}
        </Label>
        <RadioGroup
          hookFormControl={control}
          name={KNOWS_HOW}
          required
        />
      </div>
      {knows_how && (
        <>
          <Main
            style={{ marginBottom: '18px' }}
            tooltipContent={t('MANAGEMENT_PLAN.KNOW_HOW_IS_CROP_PLANTED_INFO', {seed_type})}
          >
            {t('MANAGEMENT_PLAN.WHAT_WAS_PLANTING_METHOD')}
          </Main>
          <div className={styles.radioGroupContainer}>
            <RadioGroup
              hookFormControl={control}
              name={PLANTING_TYPE}
              radios={[
                {
                  label: t('MANAGEMENT_PLAN.ROWS'),
                  value: ROWS,
                },
                { label: t('MANAGEMENT_PLAN.BEDS'), value: BEDS },
                {
                  label: t('MANAGEMENT_PLAN.INDIVIDUAL_CONTAINER'),
                  value: CONTAINER,
                }
              ]}
              required
            />
            <div className={styles.radioIconsContainer}>
              <Rows />
              <Beds />
              <Individual />
              <Monocrop />
            </div>
          </div>
          {planting_type && (
            <div className={styles.imageGrid}>
              {images[planting_type].map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`${planting_type}${index}`}
                  onClick={() => onImageSelect(url, planting_type)}
                />
              ))}
            </div>
          )}
          {imageModalSrc && (
            <ImageModal src={imageModalSrc} alt={imageModalAlt} dismissModal={dismissModal} />
          )}
        </>
      )}
    </Form>
  );
}

PureInGroundTransplant.prototype = {
  onGoBack: PropTypes.func,
  onCancel: PropTypes.func,
  onContinue: PropTypes.func,
  persistedFormData: PropTypes.func,
  useHookFormPersist: PropTypes.func,
};
