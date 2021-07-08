import Button from '../../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Label, Main } from '../../Typography';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import RadioGroup from '../../Form/RadioGroup';

export default function PureTransplant({
  isCoverCrop,
  onCancel,
  onGoBack,
  useHookFormPersist,
  persistedFormData,
  match,
  history,
}) {
  const { t } = useTranslation();
  const variety_id = match?.params?.variety_id;
  const goBackPath = `/crop/${variety_id}/add_management_plan/planted_already`;
  let submitPath = `/crop/${variety_id}/add_management_plan/planting_date`;

  // TODO: LF-1584 assignee needs to change true case for submitPath to be path to their container because crop is a wild crop and in ground:
  // if wild_crop == true and in_ground == true, then go to LF-1584 -> need in_ground check or else going back and selecting planting when previously selected wild_crop == true will not override wild_crop == false
  persistedFormData.wild_crop && persistedFormData.in_ground
    ? (submitPath = `/crop/${variety_id}/add_management_plan/planting_date`)
    : (submitPath = `/crop/${variety_id}/add_management_plan/planting_date`);

  const progress = 29;
  const TRANSPLANT = 'needs_transplant';
  const COVER = 'for_cover';

  let defaultTransplantValue;
  if (persistedFormData.in_ground) {
    defaultTransplantValue = false;
  } else if (persistedFormData.seeding_type === 'SEEDLING_OR_PLANTING_STOCK') {
    defaultTransplantValue = true;
  }

  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues:
      isCoverCrop && !persistedFormData.hasOwnProperty(COVER)
        ? { ...persistedFormData, for_cover: true, needs_transplant: defaultTransplantValue }
        : { ...persistedFormData, needs_transplant: defaultTransplantValue },
  });

  useHookFormPersist([submitPath, goBackPath], getValues);
  const onSubmit = () => {
    history?.push(submitPath);
  };

  const disabled = !isValid;

  return (
    <Form
      buttonGroup={
        <Button disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={progress}
        style={{
          marginBottom: '24px',
        }}
      />
      <div>
        <div style={{ marginBottom: '18px' }}>
          <Label
            style={{
              paddingRight: '10px',
              fontSize: '16px',
              lineHeight: '20px',
              display: 'inline-block',
            }}
          >
            {t('MANAGEMENT_PLAN.IS_TRANSPLANT')}
          </Label>
        </div>
        <RadioGroup hookFormControl={control} name={TRANSPLANT} required />
      </div>
      <div>
        {!isCoverCrop && (
          <>
            <Main
              style={{ marginTop: '16px', marginBottom: '18px' }}
              tooltipContent={t('MANAGEMENT_PLAN.COVER_INFO')}
            >
              {' '}
              {t('MANAGEMENT_PLAN.COVER_OR_HARVEST')}
            </Main>
            <RadioGroup
              hookFormControl={control}
              name={COVER}
              required={!!isCoverCrop}
              radios={[
                {
                  label: t('MANAGEMENT_PLAN.AS_COVER_CROP'),
                  value: true,
                },
                { label: t('MANAGEMENT_PLAN.FOR_HARVEST'), value: false },
              ]}
            />
          </>
        )}
      </div>
    </Form>
  );
}

PureTransplant.prototype = {
  isCoverCrop: PropTypes.bool,
  onGoBack: PropTypes.func,
  onCancel: PropTypes.func,
  persistedFormData: PropTypes.func,
  useHookFormPersist: PropTypes.func,
  match: PropTypes.object,
};
