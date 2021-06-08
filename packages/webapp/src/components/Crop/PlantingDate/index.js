import Button from '../../Form/Button';
import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import Input from '../../Form/Input';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import InputDuration from '../../Form/InputDuration';
import FullYearCalendarView from '../../FullYearCalendar';
import { cloneObject } from '../../../util';

export default function PurePlantingDate({
  useHookFormPersist,
  persistedFormData,
  match,
  history,
}) {
  const { t } = useTranslation();
  const variety_id = match?.params?.variety_id;
  const submitPath = `/crop/${variety_id}/add_management_plan/choose_planting_location`;
  const goBackPath = `/crop/${variety_id}/add_management_plan/needs_transplant`;

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
    trigger,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      [GERMINATION_DATE]: null,
      [TRANSPLANT_DATE]: persistedFormData.needs_transplant ? null : undefined,
      [HARVEST_DATE]: null,
      ...cloneObject(persistedFormData),
    },
  });
  useHookFormPersist([submitPath, goBackPath], getValues);
  const onSubmit = () => {
    history?.push(submitPath);
  };
  const onError = () => {};
  const onGoBack = () => {
    history?.push(goBackPath);
  };
  const onCancel = () => {
    history?.push(`/crop/${variety_id}/management`);
  };

  const seed_date = watch(SEED_DATE);
  const germination_date = watch(GERMINATION_DATE);
  const harvest_date = watch(HARVEST_DATE);
  const transplant_date = persistedFormData.needs_transplant ? watch(TRANSPLANT_DATE) : undefined;
  const germination_days = watch(GERMINATION_DAYS);
  const transplant_days = persistedFormData.needs_transplant ? watch(TRANSPLANT_DAYS) : undefined;
  const harvest_days = watch(HARVEST_DAYS);

  useEffect(() => {
    if (transplant_days || transplant_days === 0) trigger(TRANSPLANT_DAYS);
    if (harvest_days || harvest_days === 0) trigger(HARVEST_DAYS);
  }, [germination_days]);

  useEffect(() => {
    if (harvest_days || harvest_days === 0) trigger(HARVEST_DAYS);
  }, [transplant_days]);

  const disabled = !isValid;

  const getErrorMessage = (error, min, max) => {
    if (error?.type === 'isRequired') return t('common:REQUIRED');
    if (error?.type === 'max') return t('common:MAX_ERROR', { value: max });
    if (error?.type === 'min') return t('common:MIN_ERROR', { value: min });
  };

  const min = 0;
  const germinationDaysMax = persistedFormData.needs_transplant ? 9997 : 9998;
  const transplantDaysMax = 9998;
  const harvestDaysMax = 9999;
  const transplantDaysMin = useMemo(
    () => (germination_days > germinationDaysMax ? germinationDaysMax : germination_days),
    [germination_days],
  );
  const harvestDaysMin = useMemo(() => {
    const min = (persistedFormData.needs_transplant && transplant_days) || germination_days;
    return min > transplantDaysMax ? transplantDaysMax : min;
  }, [transplant_days, germination_days, persistedFormData.needs_transplant]);

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
        value={25}
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
        hookFormRegister={register(GERMINATION_DAYS, {
          required: true,
          valueAsNumber: true,
          max: germinationDaysMax,
          min: min + 1,
        })}
        max={germinationDaysMax}
        label={t('MANAGEMENT_PLAN.GERMINATION')}
        hookFormSetValue={setValue}
        dateName={GERMINATION_DATE}
        errors={getErrorMessage(errors[GERMINATION_DAYS], min, germinationDaysMax + 1)}
      />
      {!!persistedFormData.needs_transplant && (
        <InputDuration
          style={{ marginBottom: '40px' }}
          startDate={seed_date}
          hookFormWatch={watch}
          hookFormRegister={register(TRANSPLANT_DAYS, {
            required: true,
            valueAsNumber: true,
            max: transplantDaysMax,
            min: transplantDaysMin + 1,
          })}
          max={transplantDaysMax}
          label={t('MANAGEMENT_PLAN.TRANSPLANT')}
          hookFormSetValue={setValue}
          dateName={TRANSPLANT_DATE}
          errors={getErrorMessage(
            errors[TRANSPLANT_DAYS],
            transplantDaysMin,
            transplantDaysMax + 1,
          )}
        />
      )}
      <InputDuration
        style={{ marginBottom: '40px' }}
        startDate={seed_date}
        hookFormWatch={watch}
        hookFormRegister={register(HARVEST_DAYS, {
          required: true,
          valueAsNumber: true,
          max: harvestDaysMax,
          min: harvestDaysMin + 1,
        })}
        max={harvestDaysMax}
        label={
          persistedFormData.for_cover
            ? t('MANAGEMENT_PLAN.TERMINATION')
            : t('MANAGEMENT_PLAN.HARVEST')
        }
        hookFormSetValue={setValue}
        dateName={HARVEST_DATE}
        errors={getErrorMessage(errors[HARVEST_DAYS], harvestDaysMin, harvestDaysMax + 1)}
      />
      {seed_date && (
        <FullYearCalendarView
          {...{ seed_date, germination_date, transplant_date }}
          termination_date={persistedFormData.for_cover ? harvest_date : undefined}
          harvest_date={persistedFormData.for_cover ? undefined : harvest_date}
        />
      )}
    </Form>
  );
}

PurePlantingDate.prototype = {
  history: PropTypes.object,
  match: PropTypes.object,
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
};
