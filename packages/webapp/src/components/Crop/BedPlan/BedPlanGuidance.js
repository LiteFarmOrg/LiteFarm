import React from 'react';
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import Input from '../../Form/Input';
import Form from '../../Form';
import Button from '../../Form/Button';
import { useForm } from 'react-hook-form';
import { container_planting_depth } from '../../../util/unit';
import Unit from '../../Form/Unit';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { cloneObject } from '../../../util';

function PureBedPlanGuidance({
  onGoBack,
  onCancel,
  system,
  handleContinue,
  persistedFormData,
  useHookFormPersist,
  persistedPaths,
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
    mode: 'onBlur',
  });

  const SPECIFY_BEDS = 'beds.specify_beds';
  const PLANTING_DEPTH = 'beds.planting_depth';
  const PLANTING_DEPTH_UNIT = 'beds.planting_depth_unit';
  const BED_WIDTH = 'beds.bed_width';
  const BED_WIDTH_UNIT = 'beds.bed_width_unit';
  const BED_SPACING = 'beds.bed_spacing';
  const BED_SPACING_UNIT = 'beds.bed_spacing_unit';
  const PLANTING_NOTES = 'beds.planting_notes';

  useHookFormPersist(persistedPaths, getValues);

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
        value={75}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ paddingBottom: '24px' }}>{t('BED_PLAN.ADDITIONAL_GUIDANCE')}</Main>

      <Input
        toolTipContent={t('BED_PLAN_GUIDANCE.TOOLTIP')}
        label={t('BED_PLAN_GUIDANCE.SPECIFY_BEDS')}
        hookFormRegister={register(SPECIFY_BEDS)}
        style={{ paddingBottom: '40px' }}
        optional={true}
      />

      <Unit
        register={register}
        label={t('BED_PLAN_GUIDANCE.PLANTING_DEPTH')}
        name={PLANTING_DEPTH}
        displayUnitName={PLANTING_DEPTH_UNIT}
        errors={errors[PLANTING_DEPTH]}
        unitType={container_planting_depth}
        system={system}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        control={control}
        optional={true}
      />

      <Unit
        register={register}
        label={t('BED_PLAN_GUIDANCE.BED_WIDTH')}
        name={BED_WIDTH}
        displayUnitName={BED_WIDTH_UNIT}
        errors={errors[BED_WIDTH]}
        unitType={container_planting_depth}
        system={system}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        control={control}
        optional={true}
      />

      <Unit
        register={register}
        label={t('BED_PLAN_GUIDANCE.SPACE_BETWEEN')}
        name={BED_SPACING}
        displayUnitName={BED_SPACING_UNIT}
        errors={errors[BED_SPACING]}
        unitType={container_planting_depth}
        system={system}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        control={control}
        optional={true}
      />

      <Input
        label={t('BED_PLAN_GUIDANCE.NOTES')}
        style={{ paddingBottom: '40px' }}
        optional={true}
        hookFormRegister={register(PLANTING_NOTES)}
      />
    </Form>
  );
}

export default PureBedPlanGuidance;
