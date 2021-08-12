import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import Input, { getInputErrors, integerOnKeyDown } from '../../Form/Input';
import Form from '../../Form';
import Button from '../../Form/Button';
import { useForm } from 'react-hook-form';
import { container_planting_depth, seedYield } from '../../../util/unit';
import clsx from 'clsx';
import Unit from '../../Form/Unit';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { cloneObject } from '../../../util';
import { isNonNegativeNumber } from '../../Form/validations';
import { getBedMethodPaths } from '../getAddManagementPlanPath';

function PureBedPlan({
  history,
  system,
  crop_variety,
  useHookFormPersist,
  persistedFormData,
  isFinalPage,
}) {
  const { t } = useTranslation();
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
    defaultValues: cloneObject(persistedFormData),
    shouldUnregister: false,
    mode: 'onChange',
  });
  useHookFormPersist(getValues);
  //TODO: getPrefix()
  const prefix = `crop_management_plan.planting_management_plans.${
    isFinalPage ? 'final' : 'initial'
  }`;

  const NUMBER_OF_BEDS = `${prefix}.bed_method.number_of_beds`;
  const NUMBER_OF_ROWS_IN_BED = `${prefix}.bed_method.number_of_rows_in_bed`;
  const PLANT_SPACING_UNIT = `${prefix}.bed_method.plant_spacing_unit`;
  const PLANT_SPACING = `${prefix}.bed_method.plant_spacing`;
  const BED_LENGTH_UNIT = `${prefix}.bed_method.bed_length_unit`;
  const BED_LENGTH = `${prefix}.bed_method.bed_length`;

  const ESTIMATED_SEED = `${prefix}.estimated_seeds`;
  const ESTIMATED_SEED_UNIT = `${prefix}.estimated_seeds_unit`;
  const ESTIMATED_YIELD = `${prefix}.estimated_yield`;
  const ESTIMATED_YIELD_UNIT = `${prefix}.estimated_yield_unit`;

  const number_of_beds = watch(NUMBER_OF_BEDS);
  const number_of_rows_in_bed = watch(NUMBER_OF_ROWS_IN_BED);
  const bed_length = watch(BED_LENGTH);
  const plant_spacing = watch(PLANT_SPACING);

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
      const estimated_seed_required_in_seeds =
        (number_of_beds * number_of_rows_in_bed * bed_length) / plant_spacing;

      setValue(ESTIMATED_SEED, estimated_seed_required_in_weight);
      setValue(ESTIMATED_YIELD, estimated_yield);
      setShowEstimatedValue(true);
    } else {
      setShowEstimatedValue(false);
    }
  }, [number_of_beds, number_of_rows_in_bed, bed_length, plant_spacing]);

  const { goBackPath, submitPath, cancelPath } = useMemo(
    () => getBedMethodPaths(crop_variety.crop_variety_id, isFinalPage),
    [],
  );
  const onSubmit = () => history.push(submitPath);
  const onGoBack = () => history.push(goBackPath);
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
      <Main style={{ paddingBottom: '24px' }}>{t('BED_PLAN.PLANTING_DETAILS')}</Main>

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
        />
      </div>

      <div className={clsx(styles.row)}>
        <Unit
          register={register}
          label={t('BED_PLAN.LENGTH_OF_BED')}
          name={BED_LENGTH}
          displayUnitName={BED_LENGTH_UNIT}
          unitType={container_planting_depth}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
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
        />
      </div>

      {showEstimatedValue && (
        <div className={clsx(styles.row)}>
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
          />
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
            required={isFinalPage}
          />
        </div>
      )}
    </Form>
  );
}

export default PureBedPlan;
