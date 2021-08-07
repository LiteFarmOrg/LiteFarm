import Button from '../../Form/Button';
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import Input, { getInputErrors, integerOnKeyDown } from '../../Form/Input';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import RadioGroup from '../../Form/RadioGroup';
import Unit from '../../Form/Unit';
import { container_plant_spacing, container_planting_depth, seedYield } from '../../../util/unit';
import styles from './styles.module.scss';
import { cloneObject } from '../../../util';
import { isNonNegativeNumber } from '../../Form/validations';
import { getContainerMethodPaths } from '../getAddManagementPlanPath';

export default function PurePlantInContainer({
  useHookFormPersist,
  persistedFormData,
  system,
  history,
  crop_variety,
  isFinalPage,
}) {
  const isHistorical = persistedFormData.crop_management_plan.already_in_ground && !isFinalPage;
  const progress = useMemo(() => {
    if (isHistorical) return 55;
    if (isFinalPage) return 75;
    return 50;
  }, []);

  const prefix = `crop_management_plan.planting_management_plans.${
    isFinalPage ? 'final' : 'initial'
  }`;

  const { t } = useTranslation();
  const variety_id = crop_variety.crop_variety_id;

  const IN_GROUND = `${prefix}.container_method.in_ground`;
  const NUMBER_OF_CONTAINERS = `${prefix}.container_method.number_of_containers`;
  const PLANTS_PER_CONTAINER = `${prefix}.container_method.plants_per_container`;
  const PLANT_SPACING = `${prefix}.container_method.plant_spacing`;
  const PLANT_SPACING_UNIT = `${prefix}.container_method.plant_spacing_unit`;
  const TOTAL_PLANTS = `${prefix}.container_method.total_plants`;
  const PLANTING_DEPTH = `${prefix}.container_method.planting_depth`;
  const PLANTING_DEPTH_UNIT = `${prefix}.container_method.planting_depth_unit`;
  const PLANTING_SOIL = `${prefix}.container_method.planting_soil`;
  const CONTAINER_TYPE = `${prefix}.container_method.container_type`;
  const ESTIMATED_YIELD = `${prefix}.estimated_yield`;
  const ESTIMATED_YIELD_UNIT = `${prefix}.estimated_yield_unit`;
  const ESTIMATED_SEED = `${prefix}.estimated_seeds`;
  const ESTIMATED_SEED_UNIT = `${prefix}.estimated_seeds_unit`;
  const NOTES = `${prefix}.notes`;
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: cloneObject(persistedFormData),
  });
  useHookFormPersist(getValues);

  const { goBackPath, submitPath, cancelPath } = useMemo(
    () => getContainerMethodPaths(variety_id, persistedFormData, isFinalPage),
    [],
  );
  const onSubmit = () => history.push(submitPath);
  const onGoBack = () => history.push(goBackPath);
  const onCancel = () => history.push(cancelPath);
  const onError = () => {};

  const in_ground = watch(IN_GROUND);
  const number_of_container = watch(NUMBER_OF_CONTAINERS);
  const plants_per_container = watch(PLANTS_PER_CONTAINER);
  const total_plants = watch(TOTAL_PLANTS);
  const plant_spacing = watch(PLANT_SPACING);

  const [showEstimatedValue, setShowEstimatedValue] = useState(false);
  useEffect(() => {
    const { average_seed_weight = 0, yield_per_plant = 0 } = crop_variety;
    if (in_ground && isNonNegativeNumber(total_plants) && isNonNegativeNumber(plant_spacing)) {
      const required_seeds = total_plants * average_seed_weight;
      const estimated_yield = total_plants * yield_per_plant;
      setValue(ESTIMATED_SEED, required_seeds);
      setValue(ESTIMATED_YIELD, estimated_yield);
      setShowEstimatedValue(true);
    } else if (
      !in_ground &&
      isNonNegativeNumber(number_of_container) &&
      isNonNegativeNumber(plants_per_container)
    ) {
      const required_seeds = number_of_container * plants_per_container * average_seed_weight;
      const estimated_yield = number_of_container * plants_per_container * yield_per_plant;
      setValue(ESTIMATED_SEED, required_seeds);
      setValue(ESTIMATED_YIELD, estimated_yield);
      setShowEstimatedValue(true);
    } else {
      setShowEstimatedValue(false);
    }
  }, [in_ground, number_of_container, plants_per_container, total_plants, plant_spacing]);

  const disabled = !isValid;

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
        value={progress}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ marginBottom: '24px' }}>
        {isHistorical
          ? t('MANAGEMENT_PLAN.HISTORICAL_CONTAINER_OR_IN_GROUND')
          : t('MANAGEMENT_PLAN.CONTAINER_OR_IN_GROUND')}
      </Main>
      <RadioGroup
        hookFormControl={control}
        name={IN_GROUND}
        radios={[
          {
            label: t('MANAGEMENT_PLAN.CONTAINER'),
            value: false,
          },
          { label: t('MANAGEMENT_PLAN.IN_GROUND'), value: true },
        ]}
        required
        style={{ paddingBottom: '16px' }}
      />
      {(in_ground === true || in_ground === false) && (
        <>
          {!in_ground && (
            <div className={styles.row}>
              <Input
                label={t('MANAGEMENT_PLAN.NUMBER_OF_CONTAINER')}
                hookFormRegister={register(NUMBER_OF_CONTAINERS, {
                  required: true,
                  valueAsNumber: true,
                })}
                type={'number'}
                onKeyDown={integerOnKeyDown}
                errors={getInputErrors(errors, NUMBER_OF_CONTAINERS)}
              />
              <Input
                label={t('MANAGEMENT_PLAN.PLANTS_PER_CONTAINER')}
                hookFormRegister={register(PLANTS_PER_CONTAINER, {
                  required: true,
                  valueAsNumber: true,
                })}
                type={'number'}
                onKeyDown={integerOnKeyDown}
                errors={getInputErrors(errors, PLANTS_PER_CONTAINER)}
              />
            </div>
          )}
          {in_ground && (
            <Input
              label={t('MANAGEMENT_PLAN.TOTAL_PLANTS')}
              hookFormRegister={register(TOTAL_PLANTS, { required: true, valueAsNumber: true })}
              style={{ paddingBottom: '40px' }}
              type={'number'}
              onKeyDown={integerOnKeyDown}
              errors={getInputErrors(errors, TOTAL_PLANTS)}
            />
          )}

          <div className={in_ground ? styles.row : styles.marginBottom}>
            <Unit
              register={register}
              label={t('MANAGEMENT_PLAN.PLANTING_DEPTH')}
              name={PLANTING_DEPTH}
              displayUnitName={PLANTING_DEPTH_UNIT}
              errors={errors[PLANTING_DEPTH]}
              unitType={container_planting_depth}
              system={system}
              hookFormSetValue={setValue}
              hookFormGetValue={getValues}
              hookFromWatch={watch}
              control={control}
              optional
            />
            {in_ground && (
              <Unit
                register={register}
                label={t('MANAGEMENT_PLAN.PLANT_SPACING')}
                name={PLANT_SPACING}
                displayUnitName={PLANT_SPACING_UNIT}
                errors={errors[PLANT_SPACING]}
                unitType={container_plant_spacing}
                system={system}
                hookFormSetValue={setValue}
                hookFormGetValue={getValues}
                hookFromWatch={watch}
                control={control}
                required
              />
            )}
          </div>

          {!in_ground && (
            <>
              <Input
                label={t('MANAGEMENT_PLAN.PLANTING_SOIL')}
                hookFormRegister={register(PLANTING_SOIL)}
                style={{ paddingBottom: '40px' }}
                optional
                hasLeaf
              />
              <Input
                label={t('MANAGEMENT_PLAN.CONTAINER_TYPE')}
                hookFormRegister={register(CONTAINER_TYPE)}
                style={{ paddingBottom: '40px' }}
                optional
              />
            </>
          )}
          {showEstimatedValue && (
            <div className={styles.row}>
              <Unit
                register={register}
                label={t('MANAGEMENT_PLAN.ESTIMATED_SEED')}
                name={ESTIMATED_SEED}
                displayUnitName={ESTIMATED_SEED_UNIT}
                errors={errors[ESTIMATED_SEED]}
                unitType={seedYield}
                system={system}
                hookFormSetValue={setValue}
                hookFormGetValue={getValues}
                hookFromWatch={watch}
                control={control}
                required={isFinalPage || (isHistorical && !in_ground)}
              />
              <Unit
                register={register}
                label={t('MANAGEMENT_PLAN.ESTIMATED_YIELD')}
                name={ESTIMATED_YIELD}
                displayUnitName={ESTIMATED_YIELD_UNIT}
                errors={errors[ESTIMATED_YIELD]}
                unitType={seedYield}
                system={system}
                hookFormSetValue={setValue}
                hookFormGetValue={getValues}
                hookFromWatch={watch}
                control={control}
                required={isFinalPage || isHistorical}
              />
            </div>
          )}

          <Input
            label={t('MANAGEMENT_PLAN.PLANTING_NOTE')}
            hookFormRegister={register(NOTES)}
            optional
          />
        </>
      )}
    </Form>
  );
}

PurePlantInContainer.prototype = {
  history: PropTypes.object,
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
  crop_variety: PropTypes.object,
  system: PropTypes.oneOf(['imperial', 'metric']),
};
