import React, { useEffect, useState } from 'react';
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

function PureBedPlan({
  onGoBack,
  onCancel,
  handleContinue,
  match,
  history,
  system,
  crop_variety,
  useHookFormPersist,
  persistedFormData,
  persistedPaths,
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
  useHookFormPersist(persistedPaths, getValues);

  const NUMBER_OF_BEDS = 'beds.number_of_beds';
  const NUMBER_OF_ROWS_IN_BED = 'beds.number_of_rows_in_bed';
  const PLANT_SPACING_UNIT = 'beds.plant_spacing_unit';
  const PLANT_SPACING = 'beds.plant_spacing';
  const LENGTH_OF_BED_UNIT = 'beds.length_of_bed_unit';
  const LENGTH_OF_BED = 'beds.length_of_bed';

  const ESTIMATED_SEED = 'required_seeds';
  const ESTIMATED_SEED_UNIT = 'required_seeds_unit';
  const ESTIMATED_YIELD = 'estimated_yield';
  const ESTIMATED_YIELD_UNIT = 'estimated_yield_unit';

  const number_of_beds = watch(NUMBER_OF_BEDS);
  const number_of_rows_in_bed = watch(NUMBER_OF_ROWS_IN_BED);
  const length_of_bed = watch(LENGTH_OF_BED);
  const plant_spacing = watch(PLANT_SPACING);

  const [showEstimatedValue, setShowEstimatedValue] = useState(false);

  useEffect(() => {
    if (
      isNonNegativeNumber(number_of_beds) &&
      isNonNegativeNumber(number_of_rows_in_bed) &&
      isNonNegativeNumber(length_of_bed) &&
      isNonNegativeNumber(plant_spacing)
    ) {
      const yield_per_plant = crop_variety.yield_per_plant;
      const average_seed_weight = crop_variety.average_seed_weight;

      const estimated_yield =
        ((number_of_beds * number_of_rows_in_bed * length_of_bed) / plant_spacing) *
        yield_per_plant;

      const estimated_seed_required_in_weight =
        ((number_of_beds * number_of_rows_in_bed * length_of_bed) / plant_spacing) *
        average_seed_weight;
      const estimated_seed_required_in_seeds =
        (number_of_beds * number_of_rows_in_bed * length_of_bed) / plant_spacing;

      setValue(ESTIMATED_SEED, estimated_seed_required_in_weight);
      setValue(ESTIMATED_YIELD, estimated_yield);
      setShowEstimatedValue(true);
    } else {
      setShowEstimatedValue(false);
    }
  }, [number_of_beds, number_of_rows_in_bed, length_of_bed, plant_spacing]);

  return (
    <Form
      buttonGroup={
        <Button type={'submit'} disabled={!isValid} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(handleContinue)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
        value={55}
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
          name={LENGTH_OF_BED}
          displayUnitName={LENGTH_OF_BED_UNIT}
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
            required
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
            required
          />
        </div>
      )}
    </Form>
  );
}

export default PureBedPlan;
