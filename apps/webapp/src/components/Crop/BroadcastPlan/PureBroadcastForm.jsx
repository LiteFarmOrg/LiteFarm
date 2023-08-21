import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { Label } from '../../Typography';
import Input, { getInputErrors } from '../../Form/Input';
import InputAutoSize from '../../Form/InputAutoSize';
import { get } from 'react-hook-form';
import {
  location_area,
  area_total_area,
  getDefaultUnit,
  seedYield,
} from '../../../util/convert-units/unit';
import clsx from 'clsx';
import Unit from '../../Form/Unit';
import { getUnitOptionMap } from '../../../util/convert-units/getUnitOptionMap';
import PropTypes from 'prop-types';

export function PureBroadcastForm({
  system,
  locationSize,
  yieldPerArea,
  isFinalPage,
  register,
  getValues,
  watch,
  control,
  setValue,
  errors,
  prefix,
  disabled,
}) {
  const { t } = useTranslation(['translation']);

  const shouldValidate = { shouldValidate: true };
  const [initialSeedingRate, setInitialSeedingRate] = useState(null);
  const KgHaToKgM2 = 1 / 10000;
  const KgHaToLbAc = 2.20462 / 2.47105;
  const LbAcToKgHa = 0.453592 / 0.404686;
  const seedingRateUnit = system === 'metric' ? 'kg/ha' : 'lb/ac';
  const PERCENTAGE_PLANTED = `${prefix}.broadcast_method.percentage_planted`;
  const SEEDING_RATE = `${prefix}.broadcast_method.seeding_rate`;
  const LOCATION_SIZE = `${prefix}.broadcast_method.location_size`;
  const LOCATION_SIZE_UNIT = `${prefix}.broadcast_method.location_size_unit`;
  const AREA_USED = `${prefix}.broadcast_method.area_used`;
  const AREA_USED_UNIT = `${prefix}.broadcast_method.area_used_unit`;
  const ESTIMATED_YIELD = `crop_management_plan.estimated_yield`;
  const ESTIMATED_YIELD_UNIT = `crop_management_plan.estimated_yield_unit`;
  const ESTIMATED_SEED = `${prefix}.estimated_seeds`;
  const ESTIMATED_SEED_UNIT = `${prefix}.estimated_seeds_unit`;
  const NOTES = `${prefix}.notes`;
  const greenInput = { color: 'var(--teal900)', fontWeight: 600 };

  const percentageOfAreaPlanted = watch(PERCENTAGE_PLANTED);
  const seedingRateFormInKgM2 = watch(SEEDING_RATE);
  const areaUsed = watch(AREA_USED);

  const getErrorMessage = (name, min, max) => {
    const type = get(errors, name)?.type;
    if (type === 'required') return t('common:REQUIRED');
    if (type === 'max') return t('common:MAX_ERROR', { value: max });
    if (type === 'min') return t('common:MIN_ERROR', { value: min });
    if (type === 'validate') return t('common:MIN_ERROR', { value: min });
  };

  const seedingRateHandler = (e) => {
    const seedingRateConversion = (system === 'metric' ? 1 : LbAcToKgHa) * KgHaToKgM2;
    setValue(
      SEEDING_RATE,
      e.target.value === '' ? '' : seedingRateConversion * Number(e.target.value),
      shouldValidate,
    );
  };

  useEffect(() => {
    if (locationSize !== getValues(LOCATION_SIZE)) {
      setValue(LOCATION_SIZE, locationSize);
      setValue(
        LOCATION_SIZE_UNIT,
        getUnitOptionMap()[getDefaultUnit(location_area, locationSize, system).displayUnit],
      );
    }
  }, []);

  useEffect(() => {
    if (seedingRateFormInKgM2) {
      setInitialSeedingRate(
        system === 'metric'
          ? seedingRateFormInKgM2 / KgHaToKgM2
          : ((seedingRateFormInKgM2 / KgHaToKgM2) * KgHaToLbAc).toFixed(2),
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

  const shouldSkipEstimatedValueCalculationRef = useRef(true);
  useEffect(() => {
    if (shouldSkipEstimatedValueCalculationRef.current) {
      shouldSkipEstimatedValueCalculationRef.current = false;
    } else {
      setValue(ESTIMATED_SEED, seedingRateFormInKgM2 * areaUsed, shouldValidate);
      yieldPerArea && setValue(ESTIMATED_YIELD, areaUsed * yieldPerArea, shouldValidate);
    }
  }, [seedingRateFormInKgM2, areaUsed]);

  return (
    <>
      <Input
        hookFormRegister={register(PERCENTAGE_PLANTED, {
          required: true,
          valueAsNumber: true,
          min: { value: 0, message: t('UNIT.VALID_VALUE') + 100 },
          max: { value: 100, message: t('UNIT.VALID_VALUE') + 100 },
        })}
        unit="%"
        min={0}
        max={100}
        type={'number'}
        style={{ paddingBottom: '40px' }}
        errors={getInputErrors(errors, PERCENTAGE_PLANTED)}
        label={t('BROADCAST_PLAN.PERCENTAGE_LABEL')}
        disabled={disabled}
      />
      <div className={clsx(styles.row, styles.paddingBottom40)}>
        <div style={{ flex: '1 1 0px' }}>
          <Unit
            register={register}
            classes={{
              input: { borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px', ...greenInput },
            }}
            label={t('BROADCAST_PLAN.LOCATION_SIZE')}
            name={LOCATION_SIZE}
            displayUnitName={LOCATION_SIZE_UNIT}
            unitType={location_area}
            disabled
            system={system}
            hookFormSetValue={setValue}
            hookFormGetValue={getValues}
            hookFromWatch={watch}
            control={control}
            style={{ flex: '1 1 0px' }}
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
        errors={getErrorMessage(SEEDING_RATE, 0)}
        disabled={disabled}
      />
      <input
        {...register(SEEDING_RATE, {
          required: true,
          valueAsNumber: true,
          validate: (value) => Number(value) > 0,
        })}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {areaUsed > 0 && seedingRateFormInKgM2 > 0 && (
        <div className={clsx(isFinalPage && styles.row, styles.paddingBottom40)}>
          <Unit
            register={register}
            label={t('MANAGEMENT_PLAN.ESTIMATED_SEED')}
            name={ESTIMATED_SEED}
            displayUnitName={ESTIMATED_SEED_UNIT}
            unitType={seedYield}
            system={system}
            hookFormSetValue={setValue}
            hookFormGetValue={getValues}
            hookFromWatch={watch}
            control={control}
            required={false}
            disabled={disabled}
          />
          {isFinalPage && (
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
              required={isFinalPage}
              disabled={disabled}
            />
          )}
        </div>
      )}
      <InputAutoSize
        label={t('BROADCAST_PLAN.PLANTING_NOTES')}
        style={{ paddingBottom: '40px' }}
        hookFormRegister={register(NOTES, {
          maxLength: { value: 10000, message: t('MANAGEMENT_PLAN.NOTES_CHAR_LIMIT') },
        })}
        optional
        errors={errors[NOTES]?.message}
        disabled={disabled}
      />
    </>
  );
}

PureBroadcastForm.prototype = {
  system: PropTypes.oneOf(['imperial', 'metric']),
  isFinalPage: PropTypes.bool,
  prefix: PropTypes.string,
  register: PropTypes.func,
  getValues: PropTypes.func,
  watch: PropTypes.func,
  control: PropTypes.any,
  setValue: PropTypes.func,
  errors: PropTypes.object,
  locationSize: PropTypes.number,
  yieldPerArea: PropTypes.number,
};
