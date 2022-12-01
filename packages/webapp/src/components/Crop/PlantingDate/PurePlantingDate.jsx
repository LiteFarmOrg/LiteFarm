import Button from '../../Form/Button';
import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Info, Main } from '../../Typography';
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
import { getPlantingDatePaths } from '../getAddManagementPlanPath';
import Unit from '../../Form/Unit';
import { seedYield } from '../../../util/convert-units/unit';

export default function PurePlantingDate({
  useHookFormPersist,
  persistedFormData,
  crop_variety,
  history,
  system,
  language,
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
  const ESTIMATED_YIELD = 'crop_management_plan.estimated_yield';
  const ESTIMATED_YIELD_UNIT = 'crop_management_plan.estimated_yield_unit';

  const { already_in_ground, is_wild, for_cover, needs_transplant, is_seed } =
    persistedFormData.crop_management_plan;

  const { harvestIsMain, terminationIsMain, transplantIsMain, seedIsMain, plantingIsMain } =
    useMemo(
      () => ({
        seedIsMain: !already_in_ground && is_seed,
        plantingIsMain: !already_in_ground && !is_seed,
        transplantIsMain: already_in_ground && needs_transplant,
        harvestIsMain: already_in_ground && !needs_transplant && !is_wild && !for_cover,
        terminationIsMain: already_in_ground && !needs_transplant && !is_wild && for_cover,
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
        : terminationIsMain
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
    showEstimatedYield,
  } = useMemo(
    () => ({
      // showGerminationOffset: !already_in_ground && (is_seed || (!for_cover && needs_transplant)),
      showGerminationOffset: !already_in_ground && is_seed,
      showTransplantOffset: needs_transplant && !transplantIsMain,
      showHarvestTerminationOffset: !harvestIsMain && !terminationIsMain,
      showHarvestOffset: !for_cover && !harvestIsMain && !terminationIsMain,
      showTerminationOffset: for_cover && !harvestIsMain && !terminationIsMain,
      showEstimatedYield: already_in_ground && is_wild && needs_transplant,
    }),
    [],
  );

  useEffect(() => {
    if (
      MAIN_DATE === SEED_DATE ||
      (MAIN_DATE === PLANT_DATE && persistedFormData.crop_management_plan.seed_date)
    ) {
      showGerminationOffset &&
        !germination_days &&
        crop_variety.germination_days &&
        setValue(GERMINATION_DAYS, crop_variety.germination_days);
      showTransplantOffset &&
        !transplant_days &&
        crop_variety.transplant_days &&
        setValue(TRANSPLANT_DAYS, crop_variety.transplant_days);
      showHarvestOffset &&
        !harvest_days &&
        crop_variety.harvest_days &&
        setValue(HARVEST_DAYS, crop_variety.harvest_days);
      showTerminationOffset &&
        !termination_days &&
        crop_variety.termination_days &&
        setValue(TERMINATION_DAYS, crop_variety.termination_days);
    }
  }, []);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    trigger,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: cloneObject(persistedFormData),
  });
  const { historyCancel } = useHookFormPersist(getValues);

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
  const startDate = plantingIsMain && seed_date ? seed_date : main_date;

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

  const { submitPath } = useMemo(
    () => getPlantingDatePaths(crop_variety.crop_variety_id, persistedFormData),
    [],
  );
  const onSubmit = () => history.push(submitPath);
  const onGoBack = () => history.back();

  const onError = () => {};

  const disabled = !isValid;

  return (
    <Form
      buttonGroup={
        <Button data-cy="plantDate-submit" disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={historyCancel}
        cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={37.5}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ marginBottom: '24px' }}>{dateTitle}</Main>

      <Input
        data-cy="cropPlan-plantDate"
        style={{ marginBottom: '40px' }}
        type={'date'}
        label={dateLabel}
        hookFormRegister={register(MAIN_DATE, { required: true })}
        min={new Date().toISOString().substring(0, 10)}
        errors={getInputErrors(errors, MAIN_DATE)}
      />

      {!harvestIsMain && !terminationIsMain && (
        <>
          <Main
            style={{ marginBottom: '24px' }}
            tooltipContent={
              seedIsMain || plantingIsMain ? t('MANAGEMENT_PLAN.DURATION_TOOLTIP') : undefined
            }
          >
            {dateOffsetTitle}
          </Main>
          {seed_date && plantingIsMain && (
            <Info
              style={{
                marginTop: 0,
                transform: 'translateY(-8px)',
                marginBottom: '12px',
              }}
            >
              {t('MANAGEMENT_PLAN.PLANTING_DATE_INFO', {
                seed_date: getLocalizedDateString(seed_date),
              })}
            </Info>
          )}
        </>
      )}
      {showGerminationOffset && (
        <InputDuration
          data-cy="cropPlan-seedGermination"
          style={{ marginBottom: '40px' }}
          startDate={startDate}
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
          data-cy="cropPlan-plantTransplant"
          style={{ marginBottom: '40px' }}
          startDate={startDate}
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
          data-cy="cropPlan-plantHarvest"
          style={{ marginBottom: '16px' }}
          startDate={startDate}
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
      {showEstimatedYield && (
        <Unit
          register={register}
          label={t('MANAGEMENT_PLAN.ESTIMATED_YIELD')}
          name={ESTIMATED_YIELD}
          displayUnitName={ESTIMATED_YIELD_UNIT}
          unitType={seedYield}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          max={999}
          optional
          style={{ paddingBottom: '16px', paddingTop: '24px' }}
        />
      )}
      {main_date &&
        Math.abs(new Date(main_date).getFullYear() - new Date().getFullYear()) < 1000 &&
        !harvestIsMain &&
        !terminationIsMain && (
          <FullYearCalendarView
            language={language}
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
      {((harvestIsMain &&
        harvest_date &&
        Math.abs(new Date(harvest_date).getFullYear() - new Date().getFullYear()) < 1000) ||
        (terminationIsMain &&
          termination_date &&
          Math.abs(new Date(termination_date).getFullYear() - new Date().getFullYear()) <
            1000)) && (
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
  crop_variety: PropTypes.object,
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
