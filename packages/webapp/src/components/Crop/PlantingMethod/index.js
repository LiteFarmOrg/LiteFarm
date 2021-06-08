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
    `${DO_CDN_URL}/planting_method/Broadcast_1.jpg`,
    `${DO_CDN_URL}/planting_method/Broadcast_2.jpg`,
    `${DO_CDN_URL}/planting_method/Broadcast_3.jpg`,
  ],
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

export default function PurePlantingMethod({
  useHookFormPersist,
  persistedFormData,
  match,
  history,
}) {
  const { t } = useTranslation();
  const variety_id = match?.params?.variety_id;

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    setError,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: cloneObject(persistedFormData),
  });
  const namePrefix = 'crop_management_plan.';

  const PLANTING_TYPE = 'planting_type';
  const planting_type = watch(PLANTING_TYPE);
  const pathsToPersist = [BROADCAST, CONTAINER, BEDS, ROWS].map(
    (plantingType) => `/crop/${variety_id}/add_management_plan/${plantingType?.toLowerCase()}`,
  );
  pathsToPersist.push(`/crop/${variety_id}/add_management_plan/choose_transplant_location`);
  const submitPath = `/crop/${variety_id}/add_management_plan/${planting_type?.toLowerCase()}`;
  const goBackPath = `/crop/${variety_id}/add_management_plan/choose_transplant_location`;
  useHookFormPersist([...pathsToPersist, goBackPath], getValues);
  const onSubmit = () => {
    history?.push(submitPath);
  };
  const onError = () => {};
  const onGoBack = () => {
    history?.push(goBackPath);
  };
  const onCancel = () => {
    history?.push(`/crop/${variety_id}/management`);
  };

  const disabled = !isValid;
  const [{ imageModalSrc, imageModalAlt }, setSelectedImage] = useState({});
  const onImageSelect = (src, alt) => setSelectedImage({ imageModalSrc: src, imageModalAlt: alt });
  const dismissModal = () => setSelectedImage({});

  return (
    <Form
      buttonGroup={
        <Button disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={62.5}
        style={{ marginBottom: '24px' }}
      />
      <Main
        style={{ marginBottom: '24px' }}
        tooltipContent={t('MANAGEMENT_PLAN.PLANTING_METHOD_TOOLTIP')}
      >
        {t('MANAGEMENT_PLAN.PLANTING_METHOD')}
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
              label: t('MANAGEMENT_PLAN.CONTAINER'),
              value: CONTAINER,
            },
            { label: t('MANAGEMENT_PLAN.BROADCAST'), value: BROADCAST },
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
    </Form>
  );
}

PurePlantingMethod.prototype = {
  history: PropTypes.object,
  match: PropTypes.object,
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
};
