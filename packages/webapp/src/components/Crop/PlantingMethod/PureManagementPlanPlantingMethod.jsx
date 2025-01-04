import Button from '../../Form/Button';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import RadioGroup from '../../Form/RadioGroup';
import { cloneObject } from '../../../util';
import Unit from '../../Form/Unit';
import { seedYield } from '../../../util/convert-units/unit';
import { getPlantingMethodPaths } from '../getAddManagementPlanPath';
import { PurePlantingMethod } from './PurePlantingMethod';
import { useNavigate, useParams } from 'react-router';

export default function PureManagementPlanPlantingMethod({
  useHookFormPersist,
  persistedFormData,
  isFinalPlantingMethod,
  system,
}) {
  let navigate = useNavigate();
  let { variety_id } = useParams();
  const { t } = useTranslation();

  const { showBroadcast, showIsPlantingMethodKnown } = useMemo(() => {
    const { already_in_ground, is_wild, for_cover, needs_transplant, is_seed } =
      persistedFormData.crop_management_plan;
    const showIsPlantingMethodKnown =
      (already_in_ground && !is_wild && for_cover && !needs_transplant && isFinalPlantingMethod) ||
      (already_in_ground && !is_wild && !for_cover && !needs_transplant && isFinalPlantingMethod) ||
      (already_in_ground && !is_wild && for_cover && needs_transplant && !isFinalPlantingMethod) ||
      (already_in_ground && !is_wild && !for_cover && needs_transplant && !isFinalPlantingMethod);
    const showBroadcast =
      (!already_in_ground && is_seed && needs_transplant && !isFinalPlantingMethod) ||
      (!already_in_ground && is_seed && !needs_transplant && isFinalPlantingMethod) ||
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
  const plantingMethodPrefix = `crop_management_plan.planting_management_plans.${
    isFinalPlantingMethod ? 'final' : 'initial'
  }`;
  const ESTIMATED_YIELD = `crop_management_plan.estimated_yield`;
  const ESTIMATED_YIELD_UNIT = `crop_management_plan.estimated_yield_unit`;
  const PLANTING_METHOD = `${plantingMethodPrefix}.planting_method`;
  const planting_method = watch(PLANTING_METHOD);
  const IS_PLANTING_METHOD_KNOWN = `${plantingMethodPrefix}.is_planting_method_known`;
  const is_planting_method_known = watch(IS_PLANTING_METHOD_KNOWN);
  const { historyCancel } = useHookFormPersist(getValues);

  const onError = () => {};

  const onSubmit = () =>
    navigate(
      getPlantingMethodPaths(
        variety_id,
        persistedFormData,
        isFinalPlantingMethod,
        planting_method,
        is_planting_method_known,
      ).submitPath,
    );
  const onGoBack = () => navigate(-1);

  const disabled = !isValid;

  return (
    <Form
      buttonGroup={
        <Button data-cy="plantingMethod-submit" disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={historyCancel}
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
        <PurePlantingMethod
          planting_method={planting_method}
          PLANTING_METHOD={PLANTING_METHOD}
          title={
            showIsPlantingMethodKnown
              ? t('MANAGEMENT_PLAN.WHAT_WAS_PLANTING_METHOD')
              : t('MANAGEMENT_PLAN.PLANTING_METHOD')
          }
          control={control}
          showBroadcast={showBroadcast}
        />
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

PureManagementPlanPlantingMethod.prototype = {
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
