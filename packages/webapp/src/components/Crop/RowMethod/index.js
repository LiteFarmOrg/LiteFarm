import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import Input, { getInputErrors, integerOnKeyDown } from '../../Form/Input';
import Form from '../../Form';
import Button from '../../Form/Button';
import { useForm } from 'react-hook-form';
import { container_plant_spacing, container_planting_depth, seedYield } from '../../../util/unit';
import Unit from '../../Form/Unit';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import RadioGroup from '../../Form/RadioGroup';
import { cloneObject } from '../../../util';
import PropTypes from 'prop-types';

export default function PureRowMethod({
  system,
  variety,
  useHookFormPersist,
  persistedFormData,
  isFinalPage,
  history,
  prefix = `crop_management_plan.planting_management_plans.${isFinalPage ? 'final' : 'initial'}`,
  goBackPath,
  submitPath,
  cancelPath,
  //TODO: always use history.goBack() in management plan flow LF-1972
  onGoBack = () => (goBackPath ? history.push(goBackPath) : history.goBack()),
  isHistoricalPage,
}) {
  const { t } = useTranslation(['translation']);
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    shouldUnregister: false,
    mode: 'onChange',
    defaultValues: cloneObject(persistedFormData),
  });

  useHookFormPersist(getValues);

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
  const ESTIMATED_YIELD = `${prefix}.estimated_yield`;
  const ESTIMATED_YIELD_UNIT = `${prefix}.estimated_yield_unit`;

  const same_length = watch(SAME_LENGTH);
  const num_of_rows = watch(NUMBER_OF_ROWS);
  const length_of_row = watch(LENGTH_OF_ROW);
  const total_length = watch(TOTAL_LENGTH);
  const plant_spacing = watch(PLANT_SPACING);

  const IsValidNumberInput = (number) => number === 0 || number > 0;

  const [showEstimatedValue, setShowEstimatedValue] = useState(false);
  const shouldSkipEstimatedValueCalculationRef = useRef(true);

  useEffect(() => {
    const { average_seed_weight = 0, yield_per_plant = 0 } = variety;
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
      const estimated_seed_required =
        ((num_of_rows * length_of_row) / plant_spacing) * average_seed_weight;
      const estimated_yield = ((num_of_rows * length_of_row) / plant_spacing) * yield_per_plant;
      average_seed_weight && setValue(ESTIMATED_SEED, estimated_seed_required);
      yield_per_plant && setValue(ESTIMATED_YIELD, estimated_yield);
      setShowEstimatedValue(true);
    } else if (shouldCalculateDifferentLengthEstimatedValues) {
      const estimated_seed_required = (total_length / plant_spacing) * average_seed_weight;
      const estimated_yield = (total_length / plant_spacing) * yield_per_plant;
      average_seed_weight && setValue(ESTIMATED_SEED, estimated_seed_required);
      yield_per_plant && setValue(ESTIMATED_YIELD, estimated_yield);
      setShowEstimatedValue(true);
    } else {
      setShowEstimatedValue(false);
    }
  }, [num_of_rows, length_of_row, total_length, plant_spacing, same_length]);

  const onSubmit = () => history.push(submitPath);
  const onCancel = () => history.push(cancelPath);

  return (
    <Form
      buttonGroup={
        <Button type={'submit'} disabled={!isValid} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
        value={isFinalPage ? 75 : 55}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ paddingBottom: '24px' }}>
        {isHistoricalPage
          ? t('MANAGEMENT_PLAN.ROW_METHOD.HISTORICAL_SAME_LENGTH')
          : t('MANAGEMENT_PLAN.ROW_METHOD.SAME_LENGTH')}
      </Main>
      <div>
        <RadioGroup hookFormControl={control} name={SAME_LENGTH} required />
      </div>
      {(same_length === true || same_length === false) && (
        <>
          {same_length && (
            <>
              <div className={styles.row}>
                <Input
                  label={t('MANAGEMENT_PLAN.ROW_METHOD.NUMBER_OF_ROWS')}
                  hookFormRegister={register(NUMBER_OF_ROWS, {
                    required: true,
                    valueAsNumber: true,
                  })}
                  type={'number'}
                  onKeyDown={integerOnKeyDown}
                  max={999}
                  errors={getInputErrors(errors, NUMBER_OF_ROWS)}
                />
                <Unit
                  register={register}
                  label={t('MANAGEMENT_PLAN.ROW_METHOD.LENGTH_OF_ROW')}
                  name={LENGTH_OF_ROW}
                  displayUnitName={LENGTH_OF_ROW_UNIT}
                  errors={errors[LENGTH_OF_ROW]}
                  unitType={container_planting_depth}
                  system={system}
                  hookFormSetValue={setValue}
                  hookFormGetValue={getValues}
                  hookFromWatch={watch}
                  control={control}
                  required
                />
              </div>
            </>
          )}
          {!same_length && (
            <div style={{ marginBottom: '40px' }}>
              <Unit
                register={register}
                label={t('MANAGEMENT_PLAN.ROW_METHOD.TOTAL_LENGTH')}
                name={TOTAL_LENGTH}
                displayUnitName={TOTAL_LENGTH_UNIT}
                errors={errors[TOTAL_LENGTH]}
                unitType={container_plant_spacing}
                system={system}
                hookFormSetValue={setValue}
                hookFormGetValue={getValues}
                hookFromWatch={watch}
                control={control}
                required
              />
            </div>
          )}
          <div>
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
          </div>
          {showEstimatedValue && (
            <>
              <div className={styles.row} style={{ marginTop: '40px' }}>
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
                  required={isFinalPage}
                />
              </div>
            </>
          )}
        </>
      )}
    </Form>
  );
}

PureRowMethod.prototype = {
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
  variety: PropTypes.object,
  system: PropTypes.oneOf(['imperial', 'metric']),
  isFinalPage: PropTypes.bool,
  history: PropTypes.object,
  goBackPath: PropTypes.string,
  submitPath: PropTypes.string,
  cancelPath: PropTypes.string,
};
