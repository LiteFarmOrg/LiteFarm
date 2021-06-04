import React, { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { Label, Main } from '../Typography';
import Input from '../Form/Input';
import InputAutoSize from '../Form/InputAutoSize';
import Form from '../Form';
import Button from '../Form/Button';
import { useForm } from 'react-hook-form';
import { area_total_area, seedAmounts} from '../../util/unit'
import clsx from 'clsx';
import Unit from '../Form/Unit';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import useHookFormPersist from '../../containers/hooks/useHookFormPersist';

function PureBroadcastPlan({ handleContinue, persistedForm, system='imperial', onGoBack, onCancel }) {
  const { t } = useTranslation(['translation']);
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    setError,
    formState: { errors, isValid }
  } = useForm({
    defaultValues: { ...persistedForm, percentage_planted: 100 },
  });
  const [seedingRateValue, setSeedingRate] = useState(0);
  const KgHaToLbAc = 2.20462/2.47105;
  const LbAcToKgHa = 0.453592/0.404686;
  const seedingRateUnit = system === 'metric' ? 'kg/ha' : 'lb/ac';
  const PERCENTAGE_PLANTED = 'percentage_planted';
  const SEEDING_RATE = 'seeding_rate';
  const AREA_USED = 'area_used';
  const AREA_USED_UNIT = 'area_used_unit';
  const ESTIMATED_YIELD = 'estimated_yield';
  const ESTIMATED_YIELD_UNIT = 'estimated_yield_unit';
  const ESTIMATED_SEED = 'required_seeds';
  const ESTIMATED_SEED_UNIT = 'required_seeds_unit';
  const NOTES = 'notes';
  register(SEEDING_RATE)
  let percentageOfAreaPlanted = watch(PERCENTAGE_PLANTED, 100);
  let seedingRateForm = watch(SEEDING_RATE);
  let areaUsed = watch(AREA_USED);
  const locationSize = 20000;

  const persistedPaths = [];
  useHookFormPersist(persistedPaths, getValues);


  const seedingRateHandler = (e) => {
    const seedingRateConversion = system === 'metric' ? 1 : LbAcToKgHa;
    setValue(SEEDING_RATE, seedingRateConversion * Number(e.target.value))
  }

  useEffect(() => {
    setValue(AREA_USED, locationSize * percentageOfAreaPlanted / 100);
  }, [percentageOfAreaPlanted]);

  useEffect(() => {
    setSeedingRate(system === 'metric' ? seedingRateForm : seedingRateForm * KgHaToLbAc);
    setValue(ESTIMATED_SEED, seedingRateForm * areaUsed / 10000);
  } , [seedingRateForm, areaUsed])

  return (
    <Form buttonGroup={
      <Button type={'submit'} disabled={!isValid} fullLength>
        {t('common:CONTINUE')}
      </Button>
    } onSubmit={handleSubmit(handleContinue)}>
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        value={75}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{paddingBottom: '24px'}}>{t('BROADCAST_PLAN.PERCENTAGE_LOCATION')}</Main>
      <Input
        hookFormRegister={register(PERCENTAGE_PLANTED, { required: true })}
        style={{paddingBottom: '40px'}} label={t('BROADCAST_PLAN.PERCENTAGE_LABEL')}  />
      <div  className={clsx(styles.row, styles.paddingBottom40)}>
        <div style={{flexGrow: 1}}>
          <Label sm style={{fontSize: '14px'}}>{t('BROADCAST_PLAN.LOCATION_SIZE')}</Label>
          <Input value={locationSize}
            classes={{input: { borderRadius: '0px', borderRightStyle: 'none' }}} disabled />
        </div>
          <Unit
            register={register}
            classes={{input: {borderLeftStyle: 'none'}}}
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
            style={{ flexGrow: 1 }} />
      </div>
      <Input type={'number'} label={t('BROADCAST_PLAN.SEEDING_RATE')} defaultValue={seedingRateValue}  onChange={seedingRateHandler} unit={seedingRateUnit} style={{paddingBottom: '40px'}} />
      <div className={clsx(styles.row, styles.paddingBottom40)} style={{columnGap: '16px'}}>
        <Unit
          register={register}
          label={t('BROADCAST_PLAN.ESTIMATED_SEED')}
          name={ESTIMATED_SEED}
          displayUnitName={ESTIMATED_SEED_UNIT}
          errors={errors[ESTIMATED_SEED]}
          unitType={seedAmounts}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFormSetError={setError}
          hookFromWatch={watch}
          control={control}
          style={{ flexGrow: 1 }} />
        <Unit
          register={register}
          label={t('BROADCAST_PLAN.ESTIMATED_YIELD')}
          name={ESTIMATED_YIELD}
          displayUnitName={ESTIMATED_YIELD_UNIT}
          errors={errors[ESTIMATED_YIELD]}
          unitType={seedAmounts}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFormSetError={setError}
          hookFromWatch={watch}
          control={control}
          style={{ flexGrow: 1 }} />
      </div>
      <InputAutoSize
        optional={true}
        label={t('BROADCAST_PLAN.PLANTING_NOTES')}
        style={{ paddingBottom: '40px' }}
        hookFormRegister={register(NOTES)}
      />
    </Form>
  )
}

export default PureBroadcastPlan;