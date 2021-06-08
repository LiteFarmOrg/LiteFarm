import React, { useEffect, useState } from 'react';
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
import Unit, { unitOptionMap } from '../../Form/Unit';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import useHookFormPersist from '../../../containers/hooks/useHookFormPersist';
import { cloneObject } from '../../../util';

function PureBroadcastPlan({
  handleContinue,
  persistedForm,
  system,
  onGoBack,
  onCancel,
  persistedPaths,
  locationSize,
  yieldPerArea,
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
    defaultValues: cloneObject(persistedForm),
    shouldUnregister: false,
    mode: 'onChange',
  });
  const shouldValidate = { shouldValidate: true };
  const [seedingRateValue, setSeedingRate] = useState(0);
  const [displayedLocationSize, setDisplayedLocationSize] = useState(null);
  const KgHaToLbAc = 2.20462 / 2.47105;
  const LbAcToKgHa = 0.453592 / 0.404686;
  const seedingRateUnit = system === 'metric' ? 'kg/ha' : 'lb/ac';
  const PERCENTAGE_PLANTED = 'broadcast.percentage_planted';
  const SEEDING_RATE = 'broadcast.seeding_rate';
  const AREA_USED = 'broadcast.area_used';
  const AREA_USED_UNIT = 'broadcast.area_used_unit';
  const ESTIMATED_YIELD = 'broadcast.estimated_yield';
  const ESTIMATED_YIELD_UNIT = 'broadcast.estimated_yield_unit';
  const ESTIMATED_SEED = 'broadcast.required_seeds';
  const ESTIMATED_SEED_UNIT = 'broadcast.required_seeds_unit';
  const NOTES = 'notes';
  const greenInput = { color: 'var(--teal900)', fontWeight: 600 };

  const percentageOfAreaPlanted = watch(PERCENTAGE_PLANTED, 100);
  const seedingRateForm = watch(SEEDING_RATE, persistedForm?.broadcast?.seeding_rate);
  const areaUsed = watch(AREA_USED);
  const areaUsedUnit = watch(AREA_USED_UNIT, 'm2');

  useHookFormPersist(persistedPaths, getValues);

  const seedingRateHandler = (e) => {
    const seedingRateConversion = system === 'metric' ? 1 : LbAcToKgHa;
    setValue(
      SEEDING_RATE,
      e.target.value === '' ? '' : seedingRateConversion * Number(e.target.value),
      shouldValidate,
    );
  };

  useEffect(() => {
    const areaUsed = (locationSize * percentageOfAreaPlanted) / 100;
    setValue(AREA_USED, areaUsed, shouldValidate);
    setValue(
      AREA_USED_UNIT,
      unitOptionMap[getDefaultUnit(area_total_area, areaUsed, system).displayUnit],
      shouldValidate,
    );
  }, [percentageOfAreaPlanted]);

  useEffect(() => {
    setSeedingRate(system === 'metric' ? seedingRateForm : seedingRateForm * KgHaToLbAc);
    setValue(ESTIMATED_SEED, (seedingRateForm * areaUsed) / 10000, shouldValidate);
    setValue(ESTIMATED_YIELD, areaUsed * yieldPerArea, shouldValidate);
  }, [seedingRateForm, areaUsed]);

  useEffect(() => {
    if (areaUsedUnit?.value) {
      const newDisplayedSize = convert(locationSize).from('m2').to(areaUsedUnit.value);
      setDisplayedLocationSize(newDisplayedSize);
    }
  }, [areaUsedUnit]);

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
      <Main style={{ paddingBottom: '24px' }}>{t('BROADCAST_PLAN.PERCENTAGE_LOCATION')}</Main>
      <Input
        hookFormRegister={register(PERCENTAGE_PLANTED, { required: true, valueAsNumber: true })}
        max={100}
        type={'number'}
        style={{ paddingBottom: '40px' }}
        label={t('BROADCAST_PLAN.PERCENTAGE_LABEL')}
      />
      <div className={clsx(styles.row, styles.paddingBottom40)}>
        <div style={{ flex: '1 1 0px' }}>
          <Label sm style={{ fontSize: '14px' }}>
            {t('BROADCAST_PLAN.LOCATION_SIZE')}
          </Label>
          <Input
            value={displayedLocationSize}
            classes={{ input: { borderRadius: '0px', borderRightStyle: 'none', ...greenInput } }}
            disabled
          />
        </div>
        <Unit
          register={register}
          classes={{ input: { borderLeftStyle: 'none', ...greenInput } }}
          label={t('BROADCAST_PLAN.AREA_USED')}
          name={AREA_USED}
          displayUnitName={AREA_USED_UNIT}
          errors={errors[AREA_USED]}
          unitType={area_total_area}
          attached={true}
          disabled
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFormSetError={setError}
          hookFromWatch={watch}
          control={control}
          style={{ flex: '1 1 0px' }}
        />
      </div>
      <Input
        type={'number'}
        label={t('BROADCAST_PLAN.SEEDING_RATE')}
        value={seedingRateValue}
        onChange={seedingRateHandler}
        unit={seedingRateUnit}
        style={{ paddingBottom: '40px' }}
      />
      <input {...register(SEEDING_RATE, { required: true })} style={{ display: 'none' }} />

      {areaUsed > 0 && seedingRateForm > 0 && (
        <div className={clsx(styles.row, styles.paddingBottom40)} style={{ columnGap: '16px' }}>
          <Unit
            register={register}
            label={t('BROADCAST_PLAN.ESTIMATED_SEED')}
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
            style={{ flex: '1 1 0px' }}
          />
          <Unit
            register={register}
            label={t('BROADCAST_PLAN.ESTIMATED_YIELD')}
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
            style={{ flex: '1 1 0px' }}
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
