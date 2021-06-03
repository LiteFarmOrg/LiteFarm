import React from 'react';
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

function PureBroadcastPlan({ handleContinue, persistedForm, system='metric' }) {
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    setError,
    formState: { errors, isValid }
  } = useForm();
  const { t } = useTranslation();
  const AREA_USED = 'area_used';
  const ESTIMATED_YIELD = 'estimated_yield';
  const ESTIMATED_YIELD_UNIT = 'estimated_yield_unit';
  const ESTIMATED_SEED = 'estimated_seed';
  const ESTIMATED_SEED_UNIT = 'estimated_seed_unit';
  return (
    <Form buttonGroup={
      <Button type={'submit'} disabled={!isValid} fullLength>
        {t('common:CONTINUE')}
      </Button>
    } onSubmit={handleSubmit(handleContinue)}>
      <MultiStepPageTitle
        onGoBack={()=>{}}
        onCancel={()=>{}}
        value={50}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{paddingBottom: '24px'}}>{t('BROADCAST_PLAN.PERCENTAGE_LOCATION')}</Main>
      <Input style={{paddingBottom: '40px'}} label={t('BROADCAST_PLAN.PERCENTAGE_LABEL')}  />
      <div  className={clsx(styles.row, styles.paddingBottom40)}>
        <div style={{flexGrow: 1}}>
          <Label sm style={{fontSize: '14px'}}>{t('BROADCAST_PLAN.LOCATION_SIZE')}</Label>
          <Input  classes={{input: { borderRadius: '0px', borderRightStyle: 'none' }}} disabled />
        </div>
          <Unit
            register={register}
            classes={{input: {borderLeftStyle: 'none'}}}
            label={t('BROADCAST_PLAN.AREA_USED')}
            name={AREA_USED}
            displayUnitName={'ac'}
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
      <Input label={t('BROADCAST_PLAN.SEEDING_RATE')} style={{paddingBottom: '40px'}} />
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
        // hookFormRegister={register(areaEnum.notes)}
      />
    </Form>
  )
}

export default PureBroadcastPlan;