import Button from '../../Form/Button';
import React, { useMemo, useState } from 'react';
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
import Unit from '../../Form/Unit';
import { seedYield } from '../../../util/unit';

const BROADCAST = 'BROADCAST_METHOD';
const CONTAINER = 'CONTAINER_METHOD';
const BEDS = 'BED_METHOD';
const ROWS = 'ROW_METHOD';
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

export default function PurePlantingMethod({
  useHookFormPersist,
  persistedFormData,
  match,
  history,
  isFinalPlantingMethod,
  system,
}) {
  const { t } = useTranslation();
  const variety_id = match?.params?.variety_id;

  const { showBroadcast, showIsPlantingMethodKnown } = useMemo(() => {
    const {
      already_in_ground,
      is_wild,
      for_cover,
      needs_transplant,
      is_seed,
    } = persistedFormData.crop_management_plan;
    const showIsPlantingMethodKnown =
      (already_in_ground && !is_wild && for_cover && !needs_transplant && isFinalPlantingMethod) ||
      (already_in_ground && !is_wild && !for_cover && !needs_transplant && isFinalPlantingMethod) ||
      (already_in_ground && !is_wild && for_cover && needs_transplant && !isFinalPlantingMethod) ||
      (already_in_ground && !is_wild && !for_cover && needs_transplant && !isFinalPlantingMethod);
    const showBroadcast =
      (!already_in_ground && is_seed && for_cover && needs_transplant && !isFinalPlantingMethod) ||
      (!already_in_ground && is_seed && !for_cover && !needs_transplant && isFinalPlantingMethod) ||
      (already_in_ground && !is_wild && !for_cover && needs_transplant && !isFinalPlantingMethod) ||
      (already_in_ground && !is_wild && for_cover && needs_transplant && !isFinalPlantingMethod) ||
      (already_in_ground && !is_wild && !for_cover && !needs_transplant && isFinalPlantingMethod) ||
      (already_in_ground && !is_wild && for_cover && !needs_transplant && isFinalPlantingMethod);
    return { showBroadcast, showIsPlantingMethodKnown };
  }, []);

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
  const plantingMethodPrefix = isFinalPlantingMethod ? 'final' : 'initial';
  const ESTIMATED_YIELD = `crop_management_plan.planting_management_plans.${plantingMethodPrefix}.estimated_yield`;
  const ESTIMATED_YIELD_UNIT = `crop_management_plan.planting_management_plans.${plantingMethodPrefix}.estimated_yield_unit`;
  const PLANTING_METHOD = `crop_management_plan.planting_management_plans.${plantingMethodPrefix}.planting_method`;
  const planting_method = watch(PLANTING_METHOD);
  const IS_PLANTING_METHOD_KNOWN = `crop_management_plan.planting_management_plans.${plantingMethodPrefix}.is_planting_method_known`;
  const is_planting_method_known = watch(IS_PLANTING_METHOD_KNOWN);

  const submitPath = `/crop/${variety_id}/add_management_plan/${planting_method?.toLowerCase()}`;
  const goBackPath = `/crop/${variety_id}/add_management_plan/${
    isFinalPlantingMethod ? 'choose_final_planting_location' : 'choose_initial_planting_location'
  }`;
  useHookFormPersist(getValues);
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
        cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={isFinalPlantingMethod ? 62.5 : 54}
        style={{ marginBottom: '24px' }}
      />
      {showIsPlantingMethodKnown && (
        <>
          <Main style={{ marginBottom: '18px' }}>
            {t('MANAGEMENT_PLAN.KNOW_HOW_IS_CROP_PLANTED')}
          </Main>
          <RadioGroup hookFormControl={control} name={IS_PLANTING_METHOD_KNOWN} required />
        </>
      )}
      {(!showIsPlantingMethodKnown || is_planting_method_known) && (
        <>
          <Main
            style={{ marginBottom: '24px' }}
            tooltipContent={t('MANAGEMENT_PLAN.PLANTING_METHOD_TOOLTIP')}
          >
            {isFinalPlantingMethod
              ? t('MANAGEMENT_PLAN.PLANTING_METHOD')
              : t('MANAGEMENT_PLAN.WHAT_WAS_PLANTING_METHOD')}
          </Main>
          <div className={styles.radioGroupContainer}>
            <RadioGroup
              hookFormControl={control}
              name={PLANTING_METHOD}
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
                ...(showBroadcast
                  ? [{ label: t('MANAGEMENT_PLAN.BROADCAST'), value: BROADCAST }]
                  : []),
              ]}
              required
            />
            <div className={styles.radioIconsContainer}>
              <Rows />
              <Beds />
              <Individual />
              {showBroadcast && <Monocrop />}
            </div>
          </div>
          {planting_method && (
            <div className={styles.imageGrid}>
              {images[planting_method].map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`${planting_method}${index}`}
                  onClick={() => onImageSelect(url, planting_method)}
                />
              ))}
            </div>
          )}
          {imageModalSrc && (
            <ImageModal src={imageModalSrc} alt={imageModalAlt} dismissModal={dismissModal} />
          )}
        </>
      )}
      {is_planting_method_known === false && showIsPlantingMethodKnown && isFinalPlantingMethod && (
        <Unit
          register={register}
          label={t('MANAGEMENT_PLAN.ESTIMATED_YIELD')}
          name={ESTIMATED_YIELD}
          displayUnitName={ESTIMATED_YIELD_UNIT}
          unitType={seedYield}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          optional
        />
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
  persistedFormData: PropTypes.shape({
    crop_management_plan: PropTypes.shape({
      already_in_ground: PropTypes.bool,
      is_wild: PropTypes.bool,
      for_cover: PropTypes.bool,
      needs_transplant: PropTypes.bool,
      is_seed: PropTypes.bool,
    }),
  }),
};
