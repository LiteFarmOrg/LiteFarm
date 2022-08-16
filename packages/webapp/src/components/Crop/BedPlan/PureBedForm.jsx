import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import Input, { getInputErrors, integerOnKeyDown } from '../../Form/Input';
import {
  container_planting_depth,
  length_of_bed_or_row,
  seedYield,
} from '../../../util/convert-units/unit';
import clsx from 'clsx';
import Unit from '../../Form/Unit';
import { isNonNegativeNumber } from '../../Form/validations';
import PropTypes from 'prop-types';

export function PureBedForm({
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
  persistedFormData,
}) {
  const { t } = useTranslation();
  const NUMBER_OF_BEDS = `${prefix}.bed_method.number_of_beds`;
  const NUMBER_OF_ROWS_IN_BED = `${prefix}.bed_method.number_of_rows_in_bed`;
  const PLANT_SPACING_UNIT = `${prefix}.bed_method.plant_spacing_unit`;
  const PLANT_SPACING = `${prefix}.bed_method.plant_spacing`;
  const BED_LENGTH_UNIT = `${prefix}.bed_method.bed_length_unit`;
  const BED_LENGTH = `${prefix}.bed_method.bed_length`;

  const ESTIMATED_SEED = `${prefix}.estimated_seeds`;
  const ESTIMATED_SEED_UNIT = `${prefix}.estimated_seeds_unit`;
  const ESTIMATED_YIELD = `crop_management_plan.estimated_yield`;
  const ESTIMATED_YIELD_UNIT = `crop_management_plan.estimated_yield_unit`;
  const TASK_TYPE = `taskType.task_translation_key`;

  const number_of_beds = watch(NUMBER_OF_BEDS);
  const number_of_rows_in_bed = watch(NUMBER_OF_ROWS_IN_BED);
  const bed_length = watch(BED_LENGTH);
  const plant_spacing = watch(PLANT_SPACING);
  const task_type = watch(TASK_TYPE);
  const isTransplant =
    persistedFormData?.crop_management_plan?.needs_transplant || task_type === 'TRANSPLANT_TASK';

  const [showEstimatedValue, setShowEstimatedValue] = useState(false);
  const shouldSkipEstimatedValueCalculationRef = useRef(true);
  useEffect(() => {
    const shouldCalculateEstimatedValues =
      isNonNegativeNumber(number_of_beds) &&
      isNonNegativeNumber(number_of_rows_in_bed) &&
      isNonNegativeNumber(bed_length) &&
      isNonNegativeNumber(plant_spacing);
    if (shouldSkipEstimatedValueCalculationRef.current) {
      shouldSkipEstimatedValueCalculationRef.current = false;
      setShowEstimatedValue(shouldCalculateEstimatedValues);
    } else if (shouldCalculateEstimatedValues) {
      const yield_per_plant = crop_variety.yield_per_plant;
      const average_seed_weight = crop_variety.average_seed_weight;

      const estimated_yield =
        ((number_of_beds * number_of_rows_in_bed * bed_length) / plant_spacing) * yield_per_plant;

      const estimated_seed_required_in_weight =
        ((number_of_beds * number_of_rows_in_bed * bed_length) / plant_spacing) *
        average_seed_weight;

      average_seed_weight && setValue(ESTIMATED_SEED, estimated_seed_required_in_weight);
      yield_per_plant && setValue(ESTIMATED_YIELD, estimated_yield);
      setShowEstimatedValue(true);
    } else {
      setShowEstimatedValue(false);
    }
  }, [number_of_beds, number_of_rows_in_bed, bed_length, plant_spacing]);
  const showEstimatedYield = prefix.endsWith('final');
  return (
    <>
      <div className={clsx(styles.row)}>
        <Input
          label={t('BED_PLAN.NUMBER_0F_BEDS')}
          hookFormRegister={register(NUMBER_OF_BEDS, {
            required: true,
            valueAsNumber: true,
          })}
          type={'number'}
          onKeyDown={integerOnKeyDown}
          max={999}
          errors={getInputErrors(errors, NUMBER_OF_BEDS)}
          disabled={disabled}
        />

        <Input
          label={t('BED_PLAN.NUMBER_OF_ROWS')}
          hookFormRegister={register(NUMBER_OF_ROWS_IN_BED, {
            required: true,
            valueAsNumber: true,
          })}
          type={'number'}
          onKeyDown={integerOnKeyDown}
          max={999}
          errors={getInputErrors(errors, NUMBER_OF_ROWS_IN_BED)}
          disabled={disabled}
        />
      </div>

      <div className={clsx(styles.row)}>
        <Unit
          register={register}
          label={t('BED_PLAN.LENGTH_OF_BED')}
          name={BED_LENGTH}
          displayUnitName={BED_LENGTH_UNIT}
          unitType={length_of_bed_or_row}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          disabled={disabled}
        />

        <Unit
          register={register}
          label={t('BED_PLAN.PLANT_SPACING')}
          name={PLANT_SPACING}
          displayUnitName={PLANT_SPACING_UNIT}
          unitType={container_planting_depth}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          disabled={disabled}
        />
      </div>

      {showEstimatedValue && (
        <div
          className={clsx(
            showEstimatedYield && styles.row,
            !isTransplant && styles.paddingBottom40,
          )}
        >
          {!isTransplant && (
            <Unit
              register={register}
              label={t('MANAGEMENT_PLAN.ESTIMATED_SEED')}
              name={ESTIMATED_SEED}
              displayUnitName={ESTIMATED_SEED_UNIT}
              unitType={seedYield}
              system={system}
              hookFormSetValue={setValue}
              hookFormGetValue={getValues}
              hookFromWatch={watch}
              control={control}
              required={false}
              disabled={disabled}
            />
          )}
          {showEstimatedYield && (
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
              required={showEstimatedYield}
              disabled={disabled}
            />
          )}
        </div>
      )}
    </>
  );
}

PureBedForm.prototype = {
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
};
