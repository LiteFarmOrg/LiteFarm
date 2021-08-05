import Button from '../../Form/Button';
import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import Input, { getInputErrors } from '../../Form/Input';
import Form from '../../Form';
import { get, useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import InputDuration from '../../Form/InputDuration';
import FullYearCalendarView from '../../FullYearCalendar';
import { cloneObject } from '../../../util';
import FullMonthCalendarView from '../../MonthCalendar';
import {
  getDateDifference,
  getDateInputFormat,
  getLocalizedDateString,
} from '../../../util/moment';
import { isNonNegativeNumber } from '../../Form/validations';
import { getPlantingDatePaths } from '../addManagementPlanPath';

export default function PurePlantingDate({
  useHookFormPersist,
  persistedFormData,
  variety_id,
  history,
}) {
  const { t } = useTranslation();

  const SEED_DATE = 'crop_management_plan.seed_date';
  const PLANT_DATE = 'crop_management_plan.plant_date';
  const GERMINATION_DATE = 'crop_management_plan.germination_date';
  const HARVEST_DATE = 'crop_management_plan.harvest_date';
  const TERMINATION_DATE = 'crop_management_plan.termination_date';
  const TRANSPLANT_DATE = 'crop_management_plan.transplant_date';
  const GERMINATION_DAYS = 'crop_management_plan.germination_days';
  const HARVEST_DAYS = 'crop_management_plan.harvest_days';
  const TRANSPLANT_DAYS = 'crop_management_plan.transplant_days';
  const TERMINATION_DAYS = 'crop_management_plan.termination_days';

  const {
    already_in_ground,
    is_wild,
    for_cover,
    needs_transplant,
    is_seed,
  } = persistedFormData.crop_management_plan;

  const { harvestIsMain, coverIsMain, transplantIsMain, seedIsMain, plantingIsMain } = useMemo(
    () => ({
      seedIsMain: !already_in_ground && is_seed,
      plantingIsMain: !already_in_ground && !is_seed,
      transplantIsMain: already_in_ground && needs_transplant && !is_wild,
      harvestIsMain: already_in_ground && !needs_transplant && !is_wild && !for_cover,
      coverIsMain: already_in_ground && !needs_transplant && !is_wild && for_cover,
    }),
    [],
  );

  const MAIN_DATE = useMemo(
    () =>
      seedIsMain
        ? SEED_DATE
        : plantingIsMain
        ? PLANT_DATE
        : transplantIsMain
        ? TRANSPLANT_DATE
        : harvestIsMain
        ? HARVEST_DATE
        : coverIsMain
        ? TERMINATION_DATE
        : SEED_DATE,
    [],
  );

  const { dateTitle, dateLabel, dateOffsetTitle } = useMemo(() => {
    const titleMap = {
      [SEED_DATE]: t('MANAGEMENT_PLAN.SEED_DATE'),
      [PLANT_DATE]: t('MANAGEMENT_PLAN.PLANTING_DATE'),
      [TRANSPLANT_DATE]: t('MANAGEMENT_PLAN.TRANSPLANT_DATE'),
      [HARVEST_DATE]: t('MANAGEMENT_PLAN.HARVEST_DATE'),
      [TERMINATION_DATE]: t('MANAGEMENT_PLAN.TERMINATION_DATE'),
    };
    const dateTitle = titleMap[MAIN_DATE];
    const dateLabel = seedIsMain
      ? t('MANAGEMENT_PLAN.SEEDING_DATE')
      : plantingIsMain
      ? t('MANAGEMENT_PLAN.PLANTING_DATE_LABEL')
      : t('common:DATE');

    const subtitleMap = {
      [SEED_DATE]: t('MANAGEMENT_PLAN.DAYS_FROM_SEEDING'),
      [PLANT_DATE]: persistedFormData.crop_management_plan.seed_date
        ? t('MANAGEMENT_PLAN.DAYS_FROM_SEEDING')
        : t('MANAGEMENT_PLAN.DAYS_FROM_PLANTING'),
      [TRANSPLANT_DATE]: for_cover
        ? t('MANAGEMENT_PLAN.DAYS_TO_TERMINATION')
        : t('MANAGEMENT_PLAN.DAYS_TO_HARVEST'),
    };
    const dateOffsetTitle = subtitleMap[MAIN_DATE];

    return {
      dateTitle,
      dateLabel,
      dateOffsetTitle,
    };
  }, []);

  const {
    showGerminationOffset,
    showTransplantOffset,
    showHarvestTerminationOffset,
    showHarvestOffset,
    showTerminationOffset,
  } = useMemo(
    () => ({
      showGerminationOffset: !already_in_ground && (is_seed || (!for_cover && needs_transplant)),
      showTransplantOffset: needs_transplant && !transplantIsMain,
      showHarvestTerminationOffset: !harvestIsMain && !coverIsMain,
      showHarvestOffset: !for_cover && !harvestIsMain && !coverIsMain,
      showTerminationOffset: for_cover && !harvestIsMain && !coverIsMain,
    }),
    [],
  );

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
    defaultValues: cloneObject(persistedFormData),
  });
  useHookFormPersist(getValues);

  const seed_date = watch(SEED_DATE);
  const plant_date = watch(PLANT_DATE);
  const main_date = watch(MAIN_DATE);
  const germination_date = watch(GERMINATION_DATE);
  const harvest_date = watch(HARVEST_DATE);
  const transplant_date = watch(TRANSPLANT_DATE);
  const termination_date = watch(TERMINATION_DATE);
  const germination_days = watch(GERMINATION_DAYS);
  const transplant_days = watch(TRANSPLANT_DAYS);
  const harvest_days = watch(HARVEST_DAYS);
  const termination_days = watch(TERMINATION_DAYS);
  const getStartDate = () => {
    if (plantingIsMain && seed_date) {
      return seed_date;
    }
    return main_date;
  };

  const min = useMemo(() => {
    return plantingIsMain && seed_date ? getDateDifference(seed_date, plant_date) : 0;
  }, [plant_date]);
  const germinationDaysMax = needs_transplant ? 9997 : 9998;
  const transplantDaysMax = 9998;
  const harvestDaysMax = 9999;
  const transplantDaysMin = useMemo(() => {
    if (!showGerminationOffset) return min;
    return germination_days > germinationDaysMax ? germinationDaysMax : germination_days;
  }, [germination_days, min]);
  const harvestDaysMin = useMemo(() => {
    if (!showGerminationOffset && !showTransplantOffset) return min;
    const harvestDaysMin = (needs_transplant && transplant_days) || germination_days;
    return harvestDaysMin > transplantDaysMax ? transplantDaysMax : harvestDaysMin;
  }, [transplant_days, germination_days, needs_transplant, min]);

  const mainDateValidations = useMemo(
    () =>
      plantingIsMain && seed_date
        ? {
            min: {
              value: seed_date,
              message: t('MANAGEMENT_PLAN.PLANTING_DATE_MIN_ERROR', {
                min: getLocalizedDateString(seed_date),
              }),
            },
          }
        : {},
    [],
  );

  useEffect(() => {
    if (showTransplantOffset && isNonNegativeNumber(transplant_days)) trigger(TRANSPLANT_DAYS);
    if (showHarvestOffset && isNonNegativeNumber(harvest_days)) trigger(HARVEST_DAYS);
    if (showTerminationOffset && isNonNegativeNumber(termination_days)) trigger(TERMINATION_DAYS);
  }, [germination_days]);

  useEffect(() => {
    if (showHarvestOffset && isNonNegativeNumber(harvest_days)) trigger(HARVEST_DAYS);
    if (showTerminationOffset && isNonNegativeNumber(termination_days)) trigger(TERMINATION_DAYS);
  }, [transplant_days]);

  useEffect(() => {
    if (plantingIsMain && seed_date && plant_date) {
      if (showGerminationOffset && isNonNegativeNumber(germination_days)) trigger(GERMINATION_DAYS);
      if (showTransplantOffset && isNonNegativeNumber(transplant_days)) trigger(TRANSPLANT_DAYS);
      if (showHarvestOffset && isNonNegativeNumber(harvest_days)) trigger(HARVEST_DAYS);
      if (showTerminationOffset && isNonNegativeNumber(termination_days)) trigger(TERMINATION_DAYS);
    }
  }, [plant_date]);

  useEffect(() => {
    if (plantingIsMain && seed_date && plant_date) {
      trigger(PLANT_DATE);
    }
  }, []);

  const getErrorMessage = (error, min, max) => {
    if (error?.type === 'isRequired') return t('common:REQUIRED');
    if (error?.type === 'max') return t('common:MAX_ERROR', { value: max });
    if (error?.type === 'min') return t('common:MIN_ERROR', { value: min });
  };

  const { goBackPath, submitPath, cancelPath } = getPlantingDatePaths(variety_id);
  const onSubmit = () => history?.push(submitPath);
  const onGoBack = () => history.push(goBackPath);
  const onCancel = () => history.push(cancelPath);

  const onError = () => {};

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
        cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={25}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ marginBottom: '24px' }}>{dateTitle}</Main>

      <Input
        style={{ marginBottom: '40px' }}
        type={'date'}
        label={dateLabel}
        hookFormRegister={register(MAIN_DATE, { required: true, ...mainDateValidations })}
        errors={getInputErrors(errors, MAIN_DATE)}
      />

      {!harvestIsMain && !coverIsMain && (
        <Main
          style={{ marginBottom: '24px' }}
          tooltipContent={t('MANAGEMENT_PLAN.DURATION_TOOLTIP')}
        >
          {dateOffsetTitle}
        </Main>
      )}
      {showGerminationOffset && (
        <InputDuration
          style={{ marginBottom: '40px' }}
          startDate={getStartDate()}
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
          errors={getErrorMessage(get(errors, GERMINATION_DAYS), min, germinationDaysMax + 1)}
        />
      )}
      {showTransplantOffset && (
        <InputDuration
          style={{ marginBottom: '40px' }}
          startDate={getStartDate()}
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
            get(errors, TRANSPLANT_DAYS),
            transplantDaysMin,
            transplantDaysMax + 1,
          )}
        />
      )}
      {showHarvestTerminationOffset && (
        <InputDuration
          style={{ marginBottom: '16px' }}
          startDate={getStartDate()}
          hookFormWatch={watch}
          hookFormRegister={register(showTerminationOffset ? TERMINATION_DAYS : HARVEST_DAYS, {
            required: true,
            valueAsNumber: true,
            max: harvestDaysMax,
            min: harvestDaysMin + 1,
          })}
          max={harvestDaysMax}
          label={
            showTerminationOffset ? t('MANAGEMENT_PLAN.TERMINATION') : t('MANAGEMENT_PLAN.HARVEST')
          }
          hookFormSetValue={setValue}
          dateName={showTerminationOffset ? TERMINATION_DATE : HARVEST_DATE}
          errors={getErrorMessage(
            get(errors, showTerminationOffset ? TERMINATION_DAYS : HARVEST_DAYS),
            harvestDaysMin,
            harvestDaysMax + 1,
          )}
        />
      )}
      {main_date && !harvestIsMain && !coverIsMain && (
        <FullYearCalendarView
          {...{
            seed_date: [PLANT_DATE, SEED_DATE].includes(MAIN_DATE) ? seed_date : undefined,
            germination_date: showGerminationOffset ? germination_date : undefined,
            transplant_date:
              showTransplantOffset || MAIN_DATE === TRANSPLANT_DATE ? transplant_date : undefined,
            termination_date: showTerminationOffset ? termination_date : undefined,
            harvest_date: showHarvestOffset ? harvest_date : undefined,
            initial: MAIN_DATE.split('.')[1],
            plant_date: plantingIsMain ? plant_date : undefined,
          }}
        />
      )}
      {((harvestIsMain && harvest_date) || (coverIsMain && termination_date)) && (
        <FullMonthCalendarView
          date={
            harvestIsMain ? getDateInputFormat(harvest_date) : getDateInputFormat(termination_date)
          }
          stage={MAIN_DATE.split('.')[1]}
        />
      )}
    </Form>
  );
}

PurePlantingDate.prototype = {
  history: PropTypes.object,
  variety_id: PropTypes.string,
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.shape({
    crop_management_plan: PropTypes.shape({
      already_in_ground: PropTypes.bool,
      is_wild: PropTypes.bool,
      for_cover: PropTypes.bool,
      needs_transplant: PropTypes.bool,
      is_seed: PropTypes.bool,
      seed_date: PropTypes.string,
      plant_date: PropTypes.string,
      germination_date: PropTypes.string,
      transplant_date: PropTypes.string,
      termination_date: PropTypes.string,
      harvest_date: PropTypes.string,
      germination_days: PropTypes.number,
      transplant_days: PropTypes.number,
      termination_days: PropTypes.number,
      harvest_days: PropTypes.number,
    }),
  }),
};
