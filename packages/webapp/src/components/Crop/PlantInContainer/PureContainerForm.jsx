import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Input, { getInputErrors, integerOnKeyDown } from '../../Form/Input';
import RadioGroup from '../../Form/RadioGroup';
import Unit from '../../Form/Unit';
import {
  container_plant_spacing,
  container_planting_depth,
  seedYield,
} from '../../../util/convert-units/unit';
import styles from './styles.module.scss';
import { isNonNegativeNumber } from '../../Form/validations';
import {
  hookFormMaxLengthValidation,
  hookFormMaxValidation,
} from '../../Form/hookformValidationUtils';
import clsx from 'clsx';
import InputAutoSize from '../../Form/InputAutoSize';
import { get } from 'react-hook-form';

export default function PureContainerForm({
  system,
  crop_variety,
  isFinalPage,
  prefix = `crop_management_plan.planting_management_plans.${isFinalPage ? 'final' : 'initial'}`,
  register,
  getValues,
  watch,
  control,
  setValue,
  errors,
  disabled,
  clearErrors,
  persistedFormData,
}) {
  const { t } = useTranslation();
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
  const ESTIMATED_YIELD = `crop_management_plan.estimated_yield`;
  const ESTIMATED_YIELD_UNIT = `crop_management_plan.estimated_yield_unit`;
  const ESTIMATED_SEED = `${prefix}.estimated_seeds`;
  const ESTIMATED_SEED_UNIT = `${prefix}.estimated_seeds_unit`;
  const NOTES = `${prefix}.notes`;
  const TASK_TYPE = `taskType.task_translation_key`;

  const in_ground = watch(IN_GROUND);
  const number_of_container = watch(NUMBER_OF_CONTAINERS);
  const plants_per_container = watch(PLANTS_PER_CONTAINER);
  const total_plants = watch(TOTAL_PLANTS);
  const plant_spacing = watch(PLANT_SPACING);
  const task_type = watch(TASK_TYPE);
  const isTransplant =
    persistedFormData?.crop_management_plan?.needs_transplant || task_type === 'TRANSPLANT_TASK';

  const isPlantSpacingRequired = ![1, 0].includes(total_plants);

  const [showEstimatedValue, setShowEstimatedValue] = useState(false);
  const shouldSkipEstimatedValueCalculationRef = useRef(true);
  useEffect(() => {
    const { average_seed_weight = 0, yield_per_plant = 0 } = crop_variety;
    const shouldCalculateInGroundEstimatedValues =
      in_ground &&
      isNonNegativeNumber(total_plants) &&
      (isNonNegativeNumber(plant_spacing) || total_plants === 1);
    const shouldCalculateContainerEstimatedValues =
      !in_ground &&
      isNonNegativeNumber(number_of_container) &&
      isNonNegativeNumber(plants_per_container);
    if (shouldSkipEstimatedValueCalculationRef.current) {
      shouldSkipEstimatedValueCalculationRef.current = false;
      setShowEstimatedValue(
        shouldCalculateInGroundEstimatedValues || shouldCalculateContainerEstimatedValues,
      );
    } else if (shouldCalculateInGroundEstimatedValues) {
      get(errors, PLANT_SPACING)?.type === 'required' && clearErrors(PLANT_SPACING);
      const required_seeds = total_plants * average_seed_weight;
      const estimated_yield = total_plants * yield_per_plant;
      average_seed_weight && setValue(ESTIMATED_SEED, required_seeds);
      yield_per_plant && setValue(ESTIMATED_YIELD, estimated_yield);
      setShowEstimatedValue(true);
    } else if (shouldCalculateContainerEstimatedValues) {
      const required_seeds = number_of_container * plants_per_container * average_seed_weight;
      const estimated_yield = number_of_container * plants_per_container * yield_per_plant;
      average_seed_weight && setValue(ESTIMATED_SEED, required_seeds);
      yield_per_plant && setValue(ESTIMATED_YIELD, estimated_yield);
      setShowEstimatedValue(true);
    } else {
      setShowEstimatedValue(false);
    }
  }, [in_ground, number_of_container, plants_per_container, total_plants, plant_spacing]);
  const showEstimatedYield = prefix.endsWith('final');

  return (
    <>
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
        disabled={disabled}
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
                  max: hookFormMaxValidation(9999),
                })}
                max={9999}
                type={'number'}
                onKeyDown={integerOnKeyDown}
                errors={getInputErrors(errors, NUMBER_OF_CONTAINERS)}
                disabled={disabled}
              />
              <Input
                label={t('MANAGEMENT_PLAN.PLANTS_PER_CONTAINER')}
                hookFormRegister={register(PLANTS_PER_CONTAINER, {
                  required: true,
                  valueAsNumber: true,
                  max: hookFormMaxValidation(9999),
                })}
                max={9999}
                type={'number'}
                onKeyDown={integerOnKeyDown}
                errors={getInputErrors(errors, PLANTS_PER_CONTAINER)}
                disabled={disabled}
              />
            </div>
          )}
          {in_ground && (
            <Input
              label={t('MANAGEMENT_PLAN.TOTAL_PLANTS')}
              hookFormRegister={register(TOTAL_PLANTS, {
                required: true,
                max: hookFormMaxValidation(9999),
                valueAsNumber: true,
              })}
              max={9999}
              style={{ paddingBottom: '40px' }}
              type={'number'}
              onKeyDown={integerOnKeyDown}
              errors={getInputErrors(errors, TOTAL_PLANTS)}
              disabled={disabled}
            />
          )}

          <div className={in_ground ? styles.row : styles.paddingBottom40}>
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
              disabled={disabled}
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
                required={isPlantSpacingRequired}
                optional={!isPlantSpacingRequired}
                disabled={disabled}
              />
            )}
          </div>

          {!in_ground && (
            <>
              <Input
                label={t('MANAGEMENT_PLAN.PLANTING_SOIL')}
                hookFormRegister={register(PLANTING_SOIL, {
                  maxLength: hookFormMaxLengthValidation(),
                })}
                style={{ paddingBottom: '40px' }}
                errors={getInputErrors(errors, CONTAINER_TYPE)}
                optional
                // TODO connect this later: hasLeaf
                disabled={disabled}
              />
              <Input
                label={t('MANAGEMENT_PLAN.CONTAINER_TYPE')}
                hookFormRegister={register(CONTAINER_TYPE, {
                  maxLength: hookFormMaxLengthValidation(),
                })}
                style={{ paddingBottom: '40px' }}
                errors={getInputErrors(errors, CONTAINER_TYPE)}
                optional
                disabled={disabled}
              />
            </>
          )}
          {showEstimatedValue && (
            <div
              className={clsx(
                showEstimatedYield && styles.row,
                (isFinalPage !== undefined || !isTransplant) && styles.paddingBottom40,
              )}
            >
              {!isTransplant ? (
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
                  required={false}
                  disabled={disabled}
                />
              ) : (
                isFinalPage === false && (
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
                    required={false}
                    disabled={disabled}
                  />
                )
              )}
              {showEstimatedYield && (
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
                  required={showEstimatedYield}
                  disabled={disabled}
                />
              )}
            </div>
          )}

          <InputAutoSize
            label={t('MANAGEMENT_PLAN.PLANTING_NOTE')}
            hookFormRegister={register(NOTES, {
              maxLength: { value: 10000, message: t('MANAGEMENT_PLAN.NOTES_CHAR_LIMIT') },
            })}
            errors={errors[NOTES]?.message}
            optional
            disabled={disabled}
            style={{ paddingBottom: '40px' }}
          />
        </>
      )}
    </>
  );
}

PureContainerForm.prototype = {
  crop_variety: PropTypes.object,
  system: PropTypes.oneOf(['imperial', 'metric']),
  isFinalPage: PropTypes.bool,
  prefix: PropTypes.string,
  register: PropTypes.func,
  getValues: PropTypes.func,
  watch: PropTypes.func,
  control: PropTypes.any,
  setValue: PropTypes.func,
  errors: PropTypes.object,
  clearErrors: PropTypes.func,
};
