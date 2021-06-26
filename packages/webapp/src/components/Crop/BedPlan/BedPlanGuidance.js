// TODO: BEDPLANGUIDANCE COMPONENT

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

function PureBedPlanGuidance({
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
      <Main style={{ paddingBottom: '24px' }}>{t('BED_PLAN.ADDITIONAL_GUIDANCE')}</Main>

      <Input
        toolTipContent={'hello'}
        label={t('BED_PLAN_GUIDANCE.SPECIFY_BEDS')}
        hookFormRegister={register(NUMBER_OF_BEDS)}
        style={{ paddingBottom: '40px' }}
        optional={true}
      />

      <Unit
        register={register}
        label={t('BED_PLAN_GUIDANCE.PLANTING_DEPTH')}
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
        optional={true}
      />

      <Unit
        register={register}
        label={t('BED_PLAN_GUIDANCE.BED_WIDTH')}
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
        optional={true}
      />

      <Unit
        register={register}
        label={t('BED_PLAN_GUIDANCE.SPACE_BETWEEN')}
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
        optional={true}
      />

      <Input
        label={t('BED_PLAN_GUIDANCE.NOTES')}
        style={{ paddingBottom: '40px' }}
        optional={true}
      />
    </Form>
  );
}

export default PureBedPlanGuidance;
