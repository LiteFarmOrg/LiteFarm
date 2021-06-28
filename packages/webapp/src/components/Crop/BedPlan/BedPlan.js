// TODO: BEDPLAN COMPONENT

import React, { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { Label, Main } from '../../Typography';
import Input, { integerOnKeyDown } from '../../Form/Input';
import InputAutoSize from '../../Form/InputAutoSize';
import Form from '../../Form';
import Button from '../../Form/Button';
import { useForm } from 'react-hook-form';
import { container_planting_depth, getDefaultUnit, seedYield } from '../../../util/unit';
import clsx from 'clsx';
import convert from 'convert-units';
import Unit, { unitOptionMap } from '../../Form/Unit';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { cloneObject } from '../../../util';

function PureBedPlan({
  handleContinue,
  persistedFormData,
  useHookFormPersist,
  system, // metric or imperial
  onGoBack,
  onCancel,
  persistedPaths,
  crop_variety, // todo: added for const {average_seed_weight = 0} = crop_variety; in a useEffect for calculations
}) {
  const { t } = useTranslation(['translation']);
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
    mode: 'onBlur',
  });

  const NUMBER_OF_BEDS = 'beds.number_of_beds';
  const NUMBER_OF_ROWS_IN_BED = 'beds.number_of_rows_in_bed';
  const PLANT_SPACING_UNIT = 'beds.plant_spacing_unit';
  const PLANT_SPACING = 'beds.plant_spacing';
  const LENGTH_OF_BED_UNIT = 'beds.length_of_bed_unit';
  const LENGTH_OF_BED = 'beds.length_of_bed';

  const ESTIMATED_SEED = 'required_seeds'; // from Broadcast plan ???
  const ESTIMATED_SEED_UNIT = 'required_seeds_unit';
  const ESTIMATED_YIELD = 'estimated_yield';
  const ESTIMATED_YIELD_UNIT = 'estimated_yield_unit';

  const number_of_beds = watch(NUMBER_OF_BEDS);
  const number_of_rows_in_bed = watch(NUMBER_OF_ROWS_IN_BED);
  const length_of_bed = watch(LENGTH_OF_BED);
  const plant_spacing = watch(PLANT_SPACING);

  useHookFormPersist(persistedPaths, getValues);

  useEffect(() => {
    // const {average_seed_weight = 0, yield_per_plant = 0} = crop_variety;
    let average_seed_weight = 0.1;
    let yield_per_plant = 10;

    const estimated_yield =
      ((number_of_beds * number_of_rows_in_bed * length_of_bed) / plant_spacing) * yield_per_plant;

    const estimated_seed_required_in_weight =
      ((number_of_beds * number_of_rows_in_bed * length_of_bed) / plant_spacing) *
      average_seed_weight;
    const estimated_seed_required_in_seeds =
      (number_of_beds * number_of_rows_in_bed * length_of_bed) / plant_spacing; // todo: is number of seeds needed?

    setValue(ESTIMATED_SEED, estimated_seed_required_in_weight);
    setValue(ESTIMATED_YIELD, estimated_yield);
  }, [number_of_beds, number_of_rows_in_bed, length_of_bed, plant_spacing]);

  function check() {
    if (number_of_beds && number_of_rows_in_bed && length_of_bed && plant_spacing) {
      return true;
    }
  }

  // todo: not quite sure how to use this
  const getErrorMessage = (error, min, max) => {
    if (error?.type === 'required') return t('common:REQUIRED');
    if (error?.type === 'max') return t('common:MAX_ERROR', { value: max });
    if (error?.type === 'min') return t('common:MIN_ERROR', { value: min });
  };

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
        value={75}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ paddingBottom: '24px' }}>{t('BED_PLAN.PLANTING_DETAILS')}</Main>

      <div className={clsx(styles.row)}>
        {/*todo: is onKeyDown = {integerOnKeyDown} how to listen/gather user input?*/}
        {/* # of beds */}
        <Input
          label={t('BED_PLAN.NUMBER_0F_BEDS')}
          hookFormRegister={register(NUMBER_OF_BEDS, {
            required: true,
            valueAsNumber: true,
            min: 1,
            max: 999,
          })}
          type={'number'}
          style={{ paddingBottom: '5px', flexGrow: 1 }}
          onKeyDown={integerOnKeyDown}
          errors={getErrorMessage(errors?.BedPlan?.number_of_beds, 1, 999)}
        />

        {/* # of rows in bed */}
        <Input
          label={t('BED_PLAN.NUMBER_OF_ROWS')}
          hookFormRegister={register(NUMBER_OF_ROWS_IN_BED, {
            required: true,
            valueAsNumber: true,
            min: 1,
            max: 999,
          })}
          type={'number'}
          style={{ paddingBottom: '5px', paddingLeft: '20px', flexGrow: 1 }}
          onKeyDown={integerOnKeyDown}
        />
      </div>

      <div className={clsx(styles.row)}>
        {/*todo: how to listen/gather user input for <Unit> for calculations*/}
        {/* Length of bed */}
        <Unit
          register={register}
          label={t('BED_PLAN.LENGTH_OF_BED')}
          name={LENGTH_OF_BED}
          displayUnitName={LENGTH_OF_BED_UNIT}
          errors={errors[LENGTH_OF_BED]}
          unitType={container_planting_depth}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFormSetError={setError}
          hookFromWatch={watch}
          control={control}
          required
        />

        {/*Plant spacing*/}
        <Unit
          register={register}
          label={t('BED_PLAN.PLANT_SPACING')}
          name={PLANT_SPACING}
          displayUnitName={PLANT_SPACING_UNIT}
          errors={errors[PLANT_SPACING]}
          unitType={container_planting_depth}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFormSetError={setError}
          hookFromWatch={watch}
          control={control}
          required
          style={{ paddingLeft: '20px' }}
        />
      </div>

      {!!number_of_beds && !!number_of_rows_in_bed && !!length_of_bed && !!plant_spacing && (
        <div className={clsx(styles.row)}>
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
            hookFormSetError={setError}
            hookFromWatch={watch}
            control={control}
            required
            style={{ flexGrow: 1 }}
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
            hookFormSetError={setError}
            hookFromWatch={watch}
            control={control}
            required
            style={{ flexGrow: 1 }}
          />
        </div>
      )}
    </Form>
  );
}

export default PureBedPlan;
