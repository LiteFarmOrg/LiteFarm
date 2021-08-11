import React, { useEffect, useMemo, useState } from 'react';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { Label, Main } from '../../Typography';
import Input from '../../Form/Input';
import InputAutoSize from '../../Form/InputAutoSize';
import Form from '../../Form';
import Button from '../../Form/Button';
import { useForm } from 'react-hook-form';
import { area_total_area, getDefaultUnit, seedYield } from '../../../util/unit';
import clsx from 'clsx';
import convert from 'convert-units';
import Unit, { getUnitOptionMap } from '../../Form/Unit';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { cloneObject } from '../../../util';
import { getBroadcastMethodPaths } from '../getAddManagementPlanPath';

function PureBroadcastPlan({
  persistedFormData,
  useHookFormPersist,
  system,
  variety_id,
  history,
  locationSize,
  yieldPerArea,
  isFinalPage,
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
    defaultValues: cloneObject(persistedFormData),
    shouldUnregister: false,
    mode: 'onChange',
  });
  useHookFormPersist(getValues);

  const shouldValidate = { shouldValidate: true };
  const [displayedLocationSize, setDisplayedLocationSize] = useState(null);
  const [initialSeedingRate, setInitialSeedingRate] = useState(null);
  const KgHaToLbAc = 2.20462 / 2.47105;
  const LbAcToKgHa = 0.453592 / 0.404686;
  const seedingRateUnit = system === 'metric' ? 'kg/ha' : 'lb/ac';

  const prefix = `crop_management_plan.planting_management_plans.${
    isFinalPage ? 'final' : 'initial'
  }`;
  const PERCENTAGE_PLANTED = `${prefix}.broadcast_method.percentage_planted`;
  const SEEDING_RATE = `${prefix}.broadcast_method.seeding_rate`;
  const AREA_USED = `${prefix}.broadcast_method.area_used`;
  const AREA_USED_UNIT = `${prefix}.broadcast_method.area_used_unit`;
  const ESTIMATED_YIELD = `${prefix}.estimated_yield`;
  const ESTIMATED_YIELD_UNIT = `${prefix}.estimated_yield_unit`;
  const ESTIMATED_SEED = `${prefix}.estimated_seeds`;
  const ESTIMATED_SEED_UNIT = `${prefix}.estimated_seeds_unit`;
  const NOTES = `${prefix}.notes`;
  const greenInput = { color: 'var(--teal900)', fontWeight: 600 };

  const percentageOfAreaPlanted = watch(PERCENTAGE_PLANTED);
  const seedingRateForm = watch(SEEDING_RATE);
  const areaUsed = watch(AREA_USED);
  const areaUsedUnit = watch(AREA_USED_UNIT);

  const getErrorMessage = (error, min, max) => {
    if (error?.type === 'required') return t('common:REQUIRED');
    if (error?.type === 'max') return t('common:MAX_ERROR', { value: max });
    if (error?.type === 'min') return t('common:MIN_ERROR', { value: min });
  };

  const seedingRateHandler = (e) => {
    const seedingRateConversion = system === 'metric' ? 1 : LbAcToKgHa;
    setValue(
      SEEDING_RATE,
      e.target.value === '' ? '' : seedingRateConversion * Number(e.target.value),
      shouldValidate,
    );
  };

  useEffect(() => {
    if (seedingRateForm) {
      setInitialSeedingRate(
        system === 'metric' ? seedingRateForm : (seedingRateForm * KgHaToLbAc).toFixed(2),
      );
    }
  }, []);

  useEffect(() => {
    const areaUsed = (locationSize * percentageOfAreaPlanted) / 100;
    setValue(AREA_USED, areaUsed, shouldValidate);
    setValue(
      AREA_USED_UNIT,
      getUnitOptionMap()[getDefaultUnit(area_total_area, areaUsed, system).displayUnit],
      shouldValidate,
    );
  }, [percentageOfAreaPlanted]);

  useEffect(() => {
    setValue(ESTIMATED_SEED, (seedingRateForm * areaUsed) / 10000, shouldValidate);
    setValue(ESTIMATED_YIELD, areaUsed * yieldPerArea, shouldValidate);
  }, [seedingRateForm, areaUsed]);

  useEffect(() => {
    if (areaUsedUnit?.value) {
      const newDisplayedSize = convert(locationSize).from('m2').to(areaUsedUnit.value).toFixed(2);
      setDisplayedLocationSize(newDisplayedSize);
    }
  }, [areaUsedUnit]);

  const { goBackPath, submitPath, cancelPath } = useMemo(
    () => getBroadcastMethodPaths(variety_id, isFinalPage),
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
        value={isFinalPage ? 75 : 58}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ paddingBottom: '24px' }}>
        {isFinalPage
          ? t('BROADCAST_PLAN.PERCENTAGE_LOCATION')
          : t('BROADCAST_PLAN.HISTORICAL_PERCENTAGE_LOCATION')}
      </Main>
      <Input
        hookFormRegister={register(PERCENTAGE_PLANTED, {
          required: true,
          valueAsNumber: true,
          min: 1,
          max: 100,
        })}
        max={100}
        type={'number'}
        style={{ paddingBottom: '40px' }}
        errors={getErrorMessage(errors?.broadcast?.percentage_planted, 1, 100)}
        label={t('BROADCAST_PLAN.PERCENTAGE_LABEL')}
      />
      <div className={clsx(styles.row, styles.paddingBottom40)}>
        <div style={{ flex: '1 1 0px' }}>
          <Label>{t('BROADCAST_PLAN.LOCATION_SIZE')}</Label>
          <Input
            value={displayedLocationSize}
            classes={{
              input: {
                borderTopRightRadius: '0px',
                borderBottomRightRadius: '0px',
                borderRightStyle: 'none',
                ...greenInput,
              },
            }}
            disabled
          />
        </div>
        <Unit
          register={register}
          classes={{
            input: { borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px', ...greenInput },
          }}
          label={t('BROADCAST_PLAN.AREA_USED')}
          name={AREA_USED}
          displayUnitName={AREA_USED_UNIT}
          errors={errors[AREA_USED]}
          unitType={area_total_area}
          disabled
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          style={{ flex: '1 1 0px' }}
        />
      </div>
      <Input
        type={'number'}
        label={t('BROADCAST_PLAN.SEEDING_RATE')}
        onChange={seedingRateHandler}
        unit={seedingRateUnit}
        style={{ paddingBottom: '40px' }}
        defaultValue={initialSeedingRate}
        errors={getErrorMessage(errors?.broadcast?.seeding_rate, 1)}
      />
      <input
        {...register(SEEDING_RATE, { required: true, valueAsNumber: true, min: 1 })}
        style={{ display: 'none' }}
      />

      {areaUsed > 0 && seedingRateForm > 0 && (
        <div className={clsx(styles.row)} style={{ columnGap: '16px' }}>
          <Unit
            register={register}
            label={t('MANAGEMENT_PLAN.ESTIMATED_SEED')}
            name={ESTIMATED_SEED}
            displayUnitName={ESTIMATED_SEED_UNIT}
            errors={errors?.broadcast?.required_seeds}
            unitType={seedYield}
            system={system}
            hookFormSetValue={setValue}
            hookFormGetValue={getValues}
            hookFromWatch={watch}
            control={control}
            required={isFinalPage}
          />
          <Unit
            register={register}
            label={t('MANAGEMENT_PLAN.ESTIMATED_YIELD')}
            name={ESTIMATED_YIELD}
            displayUnitName={ESTIMATED_YIELD_UNIT}
            errors={errors?.broadcast?.estimated_yield}
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
      <InputAutoSize
        optional={true}
        label={t('BROADCAST_PLAN.PLANTING_NOTES')}
        style={{ paddingBottom: '40px' }}
        hookFormRegister={register(NOTES)}
      />
    </Form>
  );
}

export default PureBroadcastPlan;
