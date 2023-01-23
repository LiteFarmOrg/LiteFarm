import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import Input, { getInputErrors, integerOnKeyDown } from '../../Form/Input';
import {
  container_plant_spacing,
  length_of_bed_or_row,
  seedYield,
} from '../../../util/convert-units/unit';
import Unit from '../../Form/Unit';
import RadioGroup from '../../Form/RadioGroup';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Main } from '../../Typography';

export default function PureRowForm({
  system,
  crop_variety,
  isFinalPage,
  isHistoricalPage,
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
  const { t } = useTranslation(['translation']);

  const SAME_LENGTH = `${prefix}.row_method.same_length`;
  const NUMBER_OF_ROWS = `${prefix}.row_method.number_of_rows`;
  const LENGTH_OF_ROW = `${prefix}.row_method.row_length`;
  const LENGTH_OF_ROW_UNIT = `${prefix}.row_method.row_length_unit`;
  const PLANT_SPACING = `${prefix}.row_method.plant_spacing`;
  const PLANT_SPACING_UNIT = `${prefix}.row_method.plant_spacing_unit`;
  const TOTAL_LENGTH = `${prefix}.row_method.total_rows_length`;
  const TOTAL_LENGTH_UNIT = `${prefix}.row_method.total_rows_length_unit`;
  const ESTIMATED_SEED = `${prefix}.estimated_seeds`;
  const ESTIMATED_SEED_UNIT = `${prefix}.estimated_seeds_unit`;
  const ESTIMATED_YIELD = `crop_management_plan.estimated_yield`;
  const ESTIMATED_YIELD_UNIT = `crop_management_plan.estimated_yield_unit`;
  const TASK_TYPE = `taskType.task_translation_key`;

  const same_length = watch(SAME_LENGTH);
  const num_of_rows = watch(NUMBER_OF_ROWS);
  const length_of_row = watch(LENGTH_OF_ROW);
  const total_length = watch(TOTAL_LENGTH);
  const plant_spacing = watch(PLANT_SPACING);
  const task_type = watch(TASK_TYPE);
  const isTransplant =
    persistedFormData?.crop_management_plan?.needs_transplant || task_type === 'TRANSPLANT_TASK';

  const IsValidNumberInput = (number) => number === 0 || number > 0;

  /**
   * Calculates the plant count in one row given length of the row and plant spacing.
   * If length is perfectly divisible by spacing (i.e. 5m spacing in a 10m row),
   * you can plant 3 crops (at 0m, 5m, and 10m).
   * Otherwise (i.e. 6m spacing in a 10m row), you can plant only 2 crops (at 0m and 6m).
   * @param {number} length
   * @param {number} spacing
   * @returns {number} plant count
   */
  const calculatePlantCountPerRow = (length, spacing) => {
    if (!(length % spacing)) {
      return (length + spacing) / spacing;
    } else {
      return Math.ceil(length / spacing);
    }
  };

  const [showEstimatedValue, setShowEstimatedValue] = useState(false);
  const shouldSkipEstimatedValueCalculationRef = useRef(true);

  useEffect(() => {
    const { average_seed_weight = 0, yield_per_plant = 0 } = crop_variety;
    const shouldCalculatedSameLengthEstimatedValues =
      same_length &&
      IsValidNumberInput(num_of_rows) &&
      IsValidNumberInput(length_of_row) &&
      IsValidNumberInput(plant_spacing);
    const shouldCalculateDifferentLengthEstimatedValues =
      !same_length && IsValidNumberInput(total_length) && IsValidNumberInput(plant_spacing);
    if (shouldSkipEstimatedValueCalculationRef.current) {
      shouldSkipEstimatedValueCalculationRef.current = false;
      setShowEstimatedValue(
        shouldCalculatedSameLengthEstimatedValues || shouldCalculateDifferentLengthEstimatedValues,
      );
    } else if (shouldCalculatedSameLengthEstimatedValues) {
      const plantCountPerRow = calculatePlantCountPerRow(length_of_row, plant_spacing);
      const estimated_seed_required = plantCountPerRow * num_of_rows * average_seed_weight;
      const estimated_yield = plantCountPerRow * num_of_rows * yield_per_plant;
      average_seed_weight && setValue(ESTIMATED_SEED, estimated_seed_required);
      yield_per_plant && setValue(ESTIMATED_YIELD, estimated_yield);
      setShowEstimatedValue(true);
    } else if (shouldCalculateDifferentLengthEstimatedValues) {
      const totalPlantCount = calculatePlantCountPerRow(total_length, plant_spacing);
      const estimated_seed_required = totalPlantCount * average_seed_weight;
      const estimated_yield = totalPlantCount * yield_per_plant;
      average_seed_weight && setValue(ESTIMATED_SEED, estimated_seed_required);
      yield_per_plant && setValue(ESTIMATED_YIELD, estimated_yield);
      setShowEstimatedValue(true);
    } else {
      setShowEstimatedValue(false);
    }
  }, [num_of_rows, length_of_row, total_length, plant_spacing, same_length]);
  const showEstimatedYield = prefix.endsWith('final');

  return (
    <>
      <Main style={{ paddingBottom: '24px' }}>
        {isHistoricalPage
          ? t('MANAGEMENT_PLAN.ROW_METHOD.HISTORICAL_SAME_LENGTH')
          : t('MANAGEMENT_PLAN.ROW_METHOD.SAME_LENGTH')}
      </Main>
      <RadioGroup
        data-cy="rowMethod-equalLength"
        hookFormControl={control}
        name={SAME_LENGTH}
        required
        disabled={disabled}
      />
      {(same_length === true || same_length === false) && (
        <>
          {same_length && (
            <>
              <div className={styles.row}>
                <Input
                  data-cy="rowMethod-rows"
                  label={t('MANAGEMENT_PLAN.ROW_METHOD.NUMBER_OF_ROWS')}
                  hookFormRegister={register(NUMBER_OF_ROWS, {
                    required: true,
                    valueAsNumber: true,
                  })}
                  type={'number'}
                  onKeyDown={integerOnKeyDown}
                  max={999}
                  errors={getInputErrors(errors, NUMBER_OF_ROWS)}
                  disabled={disabled}
                />
                <Unit
                  data-cy="rowMethod-length"
                  register={register}
                  label={t('MANAGEMENT_PLAN.ROW_METHOD.LENGTH_OF_ROW')}
                  name={LENGTH_OF_ROW}
                  displayUnitName={LENGTH_OF_ROW_UNIT}
                  errors={errors[LENGTH_OF_ROW]}
                  unitType={length_of_bed_or_row}
                  system={system}
                  hookFormSetValue={setValue}
                  hookFormGetValue={getValues}
                  hookFromWatch={watch}
                  control={control}
                  required
                  disabled={disabled}
                />
              </div>
            </>
          )}
          {!same_length && (
            <div style={{ marginBottom: '40px' }}>
              <Unit
                data-cy="rowMethod-length"
                register={register}
                label={t('MANAGEMENT_PLAN.ROW_METHOD.TOTAL_LENGTH')}
                name={TOTAL_LENGTH}
                displayUnitName={TOTAL_LENGTH_UNIT}
                errors={errors[TOTAL_LENGTH]}
                unitType={length_of_bed_or_row}
                system={system}
                hookFormSetValue={setValue}
                hookFormGetValue={getValues}
                hookFromWatch={watch}
                control={control}
                required
                disabled={disabled}
              />
            </div>
          )}
          <div className={clsx(styles.paddingBottom40)}>
            <Unit
              data-cy="rowMethod-spacing"
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
              disabled={disabled}
            />
          </div>
          {showEstimatedValue && (
            <>
              <div
                className={clsx(
                  showEstimatedYield && styles.row,
                  !isTransplant && styles.paddingBottom40,
                )}
              >
                {!isTransplant && (
                  <Unit
                    data-cy="rowMethod-seed"
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
                )}

                {showEstimatedYield && (
                  <Unit
                    data-cy="rowMethod-yield"
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
            </>
          )}
        </>
      )}
    </>
  );
}

PureRowForm.prototype = {
  crop_variety: PropTypes.object,
  system: PropTypes.oneOf(['imperial', 'metric']),
  isFinalPage: PropTypes.bool,
  isHistoricalPage: PropTypes.bool,
  prefix: PropTypes.string,
  register: PropTypes.func,
  getValues: PropTypes.func,
  watch: PropTypes.func,
  control: PropTypes.any,
  setValue: PropTypes.func,
  errors: PropTypes.object,
};
