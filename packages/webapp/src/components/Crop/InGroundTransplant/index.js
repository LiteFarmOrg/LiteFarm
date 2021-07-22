import Button from '../../Form/Button';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
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
import { cloneObject } from '../../../util';

const BROADCAST = 'BROADCAST';
const CONTAINER = 'CONTAINER';
const BEDS = 'BEDS';
const ROWS = 'ROWS';
const images = {
  [BROADCAST]: [
    `${DO_CDN_URL}/planting_method/Broadcast_1.webp`,
    `${DO_CDN_URL}/planting_method/Broadcast_2.webp`,
    `${DO_CDN_URL}/planting_method/Broadcast_3.webp`,
  ],
  [CONTAINER]: [
    `${DO_CDN_URL}/planting_method/Individual_1.webp`,
    `${DO_CDN_URL}/planting_method/Individual_2.webp`,
    `${DO_CDN_URL}/planting_method/Individual_3.webp`,
  ],
  [BEDS]: [
    `${DO_CDN_URL}/planting_method/Bed_1.webp`,
    `${DO_CDN_URL}/planting_method/Bed_2.webp`,
    `${DO_CDN_URL}/planting_method/Bed_3.webp`,
  ],
  [ROWS]: [
    `${DO_CDN_URL}/planting_method/Rows_1.webp`,
    `${DO_CDN_URL}/planting_method/Rows_2.webp`,
    `${DO_CDN_URL}/planting_method/Rows_3.webp`,
  ],
};

export default function PureInGroundTransplant({
  useHookFormPersist,
  persistedFormData,
  history,
  variety_id,
}) {
  const { t } = useTranslation();

  const progress = 54;

  const {
    handleSubmit,
    getValues,
    watch,
    control,
    formState: { isValid },
  } = useForm({
    shouldUnregister: false,
    mode: 'onChange',
    defaultValues: cloneObject(persistedFormData),
  });

  const PLANTING_TYPE = 'planting_type';
  const planting_type = watch(PLANTING_TYPE);

  const KNOWS_HOW = 'knows_how_is_crop_planted';
  const knows_how = watch(KNOWS_HOW);

  const submitPath = knows_how
    ? `/crop/${variety_id}/add_management_plan/historical_${planting_type?.toLowerCase()}`
    : `/crop/${variety_id}/add_management_plan/choose_transplant_location`;
  const goBackPath = `/crop/${variety_id}/add_management_plan/choose_planting_location`;

  useHookFormPersist([goBackPath, submitPath], getValues);

  const [{ imageModalSrc, imageModalAlt }, setSelectedImage] = useState({});
  const onImageSelect = (src, alt) => setSelectedImage({ imageModalSrc: src, imageModalAlt: alt });
  const dismissModal = () => setSelectedImage({});

  const disabled = knows_how === undefined || (knows_how && planting_type === undefined);

  const onContinue = () => {
    history.push(submitPath);
  };

  const onGoBack = () => {
    history.push(goBackPath);
  };

  const onCancel = () => {
    history.push(`/crop/${variety_id}/management`);
  };

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
        <Main style={{ marginBottom: '18px' }}>
          {t('MANAGEMENT_PLAN.KNOW_HOW_IS_CROP_PLANTED')}
        </Main>
        <RadioGroup hookFormControl={control} name={KNOWS_HOW} required />
      </div>
      {knows_how && (
        <>
          <Main
            style={{ marginBottom: '18px' }}
            tooltipContent={t('MANAGEMENT_PLAN.WHAT_WAS_PLANTING_METHOD_INFO')}
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
                },
                { label: t('MANAGEMENT_PLAN.BROADCAST'), value: BROADCAST },
              ]}
              required
              shouldUnregister={false}
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
  history: PropTypes.object,
  persistedFormData: PropTypes.func,
  useHookFormPersist: PropTypes.func,
};
