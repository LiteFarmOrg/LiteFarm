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
  system,
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

  const AREA_USED = 'beds.area_used';
  const AREA_USED_UNIT = 'beds.area_used_unit';

  const NUMBER_OF_BEDS = 'beds.number_of_beds';
  const NUMBER_OF_ROWS_IN_BED = 'beds.number_of_rows_in_bed';
  const PLANT_SPACING_UNIT = 'beds.plant_spacing_unit';
  const PLANT_SPACING = 'beds.plant_spacing';
  const LENGTH_OF_BED_UNIT = 'beds.length_of_bed_unit';
  const LENGTH_OF_BED = 'beds.length_of_bed';

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
    </Form>
  );
}

export default PureBedPlan;
