import React from 'react';
import { useTranslation } from 'react-i18next';
import Input, { getInputErrors } from '../../Form/Input';
import { container_planting_depth } from '../../../util/convert-units/unit';
import Unit from '../../Form/Unit';
import PropTypes from 'prop-types';
import InputAutoSize from '../../Form/InputAutoSize';

export function PurePlanGuidanceForm({
  system,
  isBed,
  isFinalPage,
  prefix = `crop_management_plan.planting_management_plans.${isFinalPage ? 'final' : 'initial'}`,
  register,
  getValues,
  watch,
  control,
  setValue,
  errors,
  disabled,
}) {
  const { t } = useTranslation(['translation']);

  const SPECIFY = `${prefix}.${isBed ? `bed_method.specify_beds` : `row_method.specify_rows`}`;
  const PLANTING_DEPTH = `${prefix}.${
    isBed ? `bed_method.planting_depth` : `row_method.planting_depth`
  }`;
  const PLANTING_DEPTH_UNIT = `${prefix}.${
    isBed ? `bed_method.planting_depth_unit` : `row_method.planting_depth_unit`
  }`;
  const WIDTH = `${prefix}.${isBed ? `bed_method.bed_width` : `row_method.row_width`}`;
  const WIDTH_UNIT = `${prefix}.${
    isBed ? `bed_method.bed_width_unit` : `row_method.row_width_unit`
  }`;
  const SPACING = `${prefix}.${isBed ? `bed_method.bed_spacing` : `row_method.row_spacing`}`;
  const SPACING_UNIT = `${prefix}.${
    isBed ? `bed_method.bed_spacing_unit` : `row_method.row_spacing_unit`
  }`;
  const PLANTING_NOTES = `${prefix}.notes`;

  const TYPE = isBed ? t('PLAN_GUIDANCE.BED') : t('PLAN_GUIDANCE.ROW');
  const TYPES = isBed ? [t('PLAN_GUIDANCE.BEDS')] : [t('PLAN_GUIDANCE.ROWS')];

  const SPECIFY_LIMIT = 40;

  return (
    <>
      <Input
        toolTipContent={t('PLAN_GUIDANCE.TOOLTIP')}
        label={t('PLAN_GUIDANCE.SPECIFY', { types: TYPES })}
        hookFormRegister={register(SPECIFY, {
          maxLength: {
            value: SPECIFY_LIMIT,
            message: t('PLAN_GUIDANCE.WORD_LIMIT', { limit: SPECIFY_LIMIT }),
          },
        })}
        style={{ paddingBottom: '40px' }}
        optional={true}
        placeholder={t('PLAN_GUIDANCE.SPECIFY_PLACEHOLDER', { types: TYPES })}
        errors={getInputErrors(errors, SPECIFY)}
        disabled={disabled}
      />

      <div style={{ marginBottom: '40px' }}>
        <Unit
          register={register}
          label={t('PLAN_GUIDANCE.PLANTING_DEPTH')}
          name={PLANTING_DEPTH}
          displayUnitName={PLANTING_DEPTH_UNIT}
          unitType={container_planting_depth}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          optional={true}
          disabled={disabled}
          data-testid="planGuidance-plantingDepth"
        />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <Unit
          register={register}
          label={t('PLAN_GUIDANCE.WIDTH', { type: TYPE })}
          name={WIDTH}
          displayUnitName={WIDTH_UNIT}
          unitType={container_planting_depth}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          optional={true}
          disabled={disabled}
          data-testid="planGuidance-rowWidth"
        />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <Unit
          register={register}
          label={t('PLAN_GUIDANCE.SPACE_BETWEEN', { types: TYPES })}
          name={SPACING}
          displayUnitName={SPACING_UNIT}
          unitType={container_planting_depth}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          optional={true}
          disabled={disabled}
          data-testid="planGuidance-spaceBetween"
        />
      </div>

      <InputAutoSize
        label={t('PLAN_GUIDANCE.NOTES')}
        hookFormRegister={register(PLANTING_NOTES, {
          maxLength: { value: 10000, message: t('MANAGEMENT_PLAN.NOTES_CHAR_LIMIT') },
        })}
        errors={errors[PLANTING_NOTES]?.message}
        style={{ paddingBottom: '40px' }}
        optional={true}
        disabled={disabled}
      />
    </>
  );
}

PurePlanGuidanceForm.prototype = {
  system: PropTypes.oneOf(['imperial', 'metric']),
  isFinalPage: PropTypes.bool,
  prefix: PropTypes.string,
  register: PropTypes.func,
  getValues: PropTypes.func,
  watch: PropTypes.func,
  control: PropTypes.any,
  setValue: PropTypes.func,
  errors: PropTypes.object,
  isBed: PropTypes.bool,
};
