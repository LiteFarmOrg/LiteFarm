import Button from '../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Main } from '../Typography';
import Input from '../Form/Input';
import Form from '../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import InputDuration from '../Form/InputDuration';
import { getDateInputFormat } from '../LocationDetailLayout/utils';
import FullYearCalendarView from '../FullYearCalendar';

export default function PurePlantingDate({
  onSubmit,
  onError,
  onGoBack,
  onCancel,
  useHookFormPersist,
  persistedFormData,
}) {
  const { t } = useTranslation();
  const SEED_DATE = 'seed_date';
  const GERMINATION_DATE = 'germination_date';
  const HARVEST_DATE = 'harvest_date';
  const TRANSPLANT_DATE = 'transplant_date';
  const GERMINATION_DAYS = 'germination_days';
  const HARVEST_DAYS = 'harvest_days';
  const TRANSPLANT_DAYS = 'transplant_days';
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: {
      [SEED_DATE]: getDateInputFormat(new Date()),
      [GERMINATION_DATE]: '',
      [TRANSPLANT_DATE]: persistedFormData.needs_transplant ? null : undefined,
      [HARVEST_DATE]: null,
      ...persistedFormData,
    },
  });
  useHookFormPersist([], getValues);

  const seed_date = watch(SEED_DATE);
  const germination_date = watch(GERMINATION_DATE);
  const harvest_date = watch(HARVEST_DATE);
  const transplant_date = watch(TRANSPLANT_DATE);
  const germination_days = watch(GERMINATION_DAYS);
  const transplant_days = watch(TRANSPLANT_DAYS);

  const disabled = !isValid;

  return (
    <Form
      buttonGroup={
        <Button disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={15}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ marginBottom: '24px' }}>{t('MANAGEMENT_PLAN.PLANTING_DATE')}</Main>

      <Input
        style={{ marginBottom: '40px' }}
        type={'date'}
        label={t('common:DATE')}
        hookFormRegister={register(SEED_DATE, { required: true })}
        errors={errors[SEED_DATE] && t('common:REQUIRED')}
      />
      <Main style={{ marginBottom: '24px' }} tooltipContent={t('MANAGEMENT_PLAN.DURATION_TOOLTIP')}>
        {t('MANAGEMENT_PLAN.DAYS_FROM_SEEDING')}
      </Main>
      <InputDuration
        style={{ marginBottom: '40px' }}
        startDate={seed_date}
        hookFormWatch={watch}
        hookFormRegister={register(GERMINATION_DAYS, { required: true, valueAsNumber: true })}
        label={t('MANAGEMENT_PLAN.GERMINATION')}
        hookFormSetValue={setValue}
        dateName={GERMINATION_DATE}
        max={999}
        min={0}
        errors={errors[GERMINATION_DAYS] && t('common:REQUIRED')}
      />
      {!!persistedFormData.needs_transplant && (
        <InputDuration
          style={{ marginBottom: '40px' }}
          startDate={seed_date}
          hookFormWatch={watch}
          hookFormRegister={register(TRANSPLANT_DAYS, { required: true, valueAsNumber: true })}
          label={t('MANAGEMENT_PLAN.TRANSPLANT')}
          hookFormSetValue={setValue}
          dateName={TRANSPLANT_DATE}
          max={999}
          min={germination_days}
          errors={errors[TRANSPLANT_DAYS] && t('common:REQUIRED')}
        />
      )}
      <InputDuration
        style={{ marginBottom: '40px' }}
        startDate={seed_date}
        hookFormWatch={watch}
        hookFormRegister={register(HARVEST_DAYS, { required: true, valueAsNumber: true })}
        label={
          persistedFormData.for_cover
            ? t('MANAGEMENT_PLAN.TERMINATION')
            : t('MANAGEMENT_PLAN.HARVEST')
        }
        hookFormSetValue={setValue}
        dateName={HARVEST_DATE}
        max={999}
        min={transplant_days || germination_days}
        errors={errors[HARVEST_DAYS] && t('common:REQUIRED')}
      />
      <FullYearCalendarView
        {...{ seed_date, germination_date, transplant_date }}
        termination_date={persistedFormData.for_cover ? harvest_date : undefined}
        harvest_date={persistedFormData.for_cover ? undefined : harvest_date}
      />
    </Form>
  );
}

PurePlantingDate.prototype = {
  history: PropTypes.object,
  match: PropTypes.object,
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
};
