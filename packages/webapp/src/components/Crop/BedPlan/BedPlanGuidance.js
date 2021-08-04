import React from 'react';
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import Input, { getInputErrors } from '../../Form/Input';
import Form from '../../Form';
import Button from '../../Form/Button';
import { useForm } from 'react-hook-form';
import { container_planting_depth } from '../../../util/unit';
import Unit from '../../Form/Unit';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { cloneObject } from '../../../util';

function PurePlanGuidance({
  onGoBack,
  onCancel,
  system,
  handleContinue,
  persistedFormData,
  useHookFormPersist,
  persistedPaths,
  isBed,
  isInitialPlantingManagementPlan,
  match,
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
    defaultValues: cloneObject(persistedFormData),
    shouldUnregister: false,
    mode: 'onChange',
  });

  const prefix = `crop_management_plan.planting_management_plans.${
    isInitialPlantingManagementPlan ? 'initial' : 'final'
  }`;

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
  const PLANTING_NOTES = `${prefix}.${
    isBed ? `bed_method.planting_notes` : `row_method.planting_notes`
  }`;

  const TYPE = isBed ? t('PLAN_GUIDANCE.BED') : t('PLAN_GUIDANCE.ROW');
  const TYPES = isBed ? [t('PLAN_GUIDANCE.BEDS')] : [t('PLAN_GUIDANCE.ROWS')];

  const SPECIFY_LIMIT = 40;

  useHookFormPersist(getValues, persistedPaths);

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
        cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
        value={75}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ paddingBottom: '24px' }}>{t('PLAN_GUIDANCE.ADDITIONAL_GUIDANCE')}</Main>

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
        />
      </div>

      <Input
        label={t('PLAN_GUIDANCE.NOTES')}
        style={{ paddingBottom: '40px' }}
        optional={true}
        hookFormRegister={register(PLANTING_NOTES)}
      />
    </Form>
  );
}

export default PurePlanGuidance;
