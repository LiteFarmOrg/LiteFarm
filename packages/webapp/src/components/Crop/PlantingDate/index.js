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
import { seedingType } from '../PlantedAlready/constants';
import FullMonthCalendarView from '../../MonthCalendar';
import { getDateInputFormat } from '../../LocationDetailLayout/utils';

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
  const PLANTING_DATE = 'planting_date';
  const GERMINATION_DATE = 'germination_date';
  const HARVEST_DATE = 'harvest_date';
  const TERMINATION_DATE = 'termination_date';
  const TRANSPLANT_DATE = 'transplant_date';
  const GERMINATION_DAYS = 'germination_days';
  const HARVEST_DAYS = 'harvest_days';
  const TRANSPLANT_DAYS = 'transplant_days';
  const TERMINATION_DAYS = 'termination_days';
  const isWildCrop = Boolean(persistedFormData.wild_crop);
  const isInGround = Boolean(persistedFormData.in_ground);
  const isTransplant = Boolean(persistedFormData.needs_transplant);
  const isCoverCrop = Boolean(persistedFormData.for_cover);
  const seedIsMain = !isInGround && persistedFormData?.seeding_type === seedingType.SEED;
  const seedlingIsMain = !isInGround && persistedFormData?.seeding_type === seedingType.SEEDLING;
  const transplantIsMain = isInGround && isTransplant && !isWildCrop;
  const harvestIsMain = isInGround && !isTransplant && !isWildCrop && !isCoverCrop;
  const coverIsMain = isInGround && !isTransplant && !isWildCrop && isCoverCrop;
  const MAIN_DATE = seedIsMain
    ? SEED_DATE
    : seedlingIsMain
    ? PLANTING_DATE
    : transplantIsMain
    ? TRANSPLANT_DATE
    : harvestIsMain
    ? HARVEST_DATE
    : coverIsMain
    ? TERMINATION_DATE
    : SEED_DATE;
  const titleMap = {
    seed_date: t('MANAGEMENT_PLAN.SEED_DATE'),
    planting_date: t('MANAGEMENT_PLAN.PLANTING_DATE'),
    transplant_date: t('MANAGEMENT_PLAN.TRANSPLANT_DATE'),
    harvest_date: t('MANAGEMENT_PLAN.HARVEST_DATE'),
    termination_date: t('MANAGEMENT_PLAN.TERMINATION_DATE'),
  };

  const subtitleMap = {
    seed_date: t('MANAGEMENT_PLAN.DAYS_FROM_SEEDING'),
    planting_date: t('MANAGEMENT_PLAN.DAYS_FROM_SEEDING'),
    transplant_date: isCoverCrop
      ? t('MANAGEMENT_PLAN.DAYS_TO_TERMINATION')
      : t('MANAGEMENT_PLAN.DAYS_TO_HARVEST'),
  };
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
      [TERMINATION_DATE]: null,
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
  const planting_date = watch(PLANTING_DATE);
  const main_date = watch(MAIN_DATE);
  const germination_date = watch(GERMINATION_DATE);
  const harvest_date = watch(HARVEST_DATE);
  const transplant_date = watch(TRANSPLANT_DATE);
  const termination_date = watch(TERMINATION_DATE);
  const germination_days = watch(GERMINATION_DAYS);
  const transplant_days = watch(TRANSPLANT_DAYS);
  const harvest_days = watch(HARVEST_DAYS);
  const termination_days = watch(TERMINATION_DAYS);
  useEffect(() => {
    if (!persistedFormData?.needs_transplant) {
      setValue(TRANSPLANT_DAYS, undefined);
      setValue(TRANSPLANT_DATE, undefined);
    }
    if (persistedFormData.for_cover) {
      setValue(HARVEST_DATE, undefined);
      setValue(HARVEST_DAYS, undefined);
    } else {
      setValue(TERMINATION_DATE, undefined);
      setValue(TERMINATION_DAYS, undefined);
    }
    if (!seedIsMain) {
      setValue(GERMINATION_DATE, undefined);
      setValue(SEED_DATE, undefined);
      setValue(GERMINATION_DAYS, undefined);
    } else {
      setValue(PLANTING_DATE, undefined);
    }
  }, []);

  useEffect(() => {
    if (transplant_days || transplant_days === 0) trigger(TRANSPLANT_DAYS);
    if (harvest_days || harvest_days === 0) trigger(HARVEST_DAYS);
    if (termination_days || termination_days === 0) trigger(TERMINATION_DAYS);
  }, [germination_days]);

  useEffect(() => {
    if (harvest_days || harvest_days === 0) trigger(HARVEST_DAYS);
    if (termination_days || termination_days === 0) trigger(TERMINATION_DAYS);
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
        cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={25}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ marginBottom: '24px' }}>{titleMap[MAIN_DATE]}</Main>

      <Input
        style={{ marginBottom: '40px' }}
        type={'date'}
        label={
          seedIsMain
            ? t('MANAGEMENT_PLAN.SEEDING_DATE')
            : seedlingIsMain
            ? t('MANAGEMENT_PLAN.PLANTING_DATE_LABEL')
            : t('common:DATE')
        }
        hookFormRegister={register(MAIN_DATE, { required: true })}
        errors={errors[MAIN_DATE] && t('common:REQUIRED')}
      />

      {!harvestIsMain && !coverIsMain && (
        <Main
          style={{ marginBottom: '24px' }}
          tooltipContent={t('MANAGEMENT_PLAN.DURATION_TOOLTIP')}
        >
          {subtitleMap[MAIN_DATE]}
        </Main>
      )}
      {MAIN_DATE === SEED_DATE && (
        <InputDuration
          style={{ marginBottom: '40px' }}
          startDate={main_date}
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
      )}
      {!!persistedFormData.needs_transplant && !transplantIsMain && (
        <InputDuration
          style={{ marginBottom: '40px' }}
          startDate={main_date}
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
      {!harvestIsMain && !coverIsMain && (
        <InputDuration
          style={{ marginBottom: '16px' }}
          startDate={main_date}
          hookFormWatch={watch}
          hookFormRegister={register(
            persistedFormData.for_cover ? TERMINATION_DAYS : HARVEST_DAYS,
            {
              required: true,
              valueAsNumber: true,
              max: harvestDaysMax,
              min: harvestDaysMin + 1,
            },
          )}
          max={harvestDaysMax}
          label={
            persistedFormData.for_cover
              ? t('MANAGEMENT_PLAN.TERMINATION')
              : t('MANAGEMENT_PLAN.HARVEST')
          }
          hookFormSetValue={setValue}
          dateName={persistedFormData.for_cover ? TERMINATION_DATE : HARVEST_DATE}
          errors={getErrorMessage(
            errors[persistedFormData.for_cover ? TERMINATION_DAYS : HARVEST_DAYS],
            harvestDaysMin,
            harvestDaysMax + 1,
          )}
        />
      )}
      {main_date && !harvestIsMain && !coverIsMain && (
        <FullYearCalendarView
          {...{
            seed_date,
            germination_date,
            transplant_date,
            termination_date,
            harvest_date,
            initial: MAIN_DATE,
            planting_date,
          }}
        />
      )}
      {(harvestIsMain || coverIsMain) &&
        ((harvestIsMain && harvest_date) || (coverIsMain && termination_date)) && (
          <FullMonthCalendarView
            date={
              harvestIsMain
                ? getDateInputFormat(harvest_date)
                : getDateInputFormat(termination_date)
            }
            stage={MAIN_DATE}
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
