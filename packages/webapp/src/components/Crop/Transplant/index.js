import Button from '../../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Label, Main } from '../../Typography';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import RadioGroup from '../../Form/RadioGroup';
import { cloneObject } from '../../../util';
import { getTransplantPaths } from '../getAddManagementPlanPath';

export default function PureTransplant({
  can_be_cover_crop,
  useHookFormPersist,
  persistedFormData,
  match,
  history,
}) {
  const { t } = useTranslation();

  const progress = 25;
  const TRANSPLANT = 'crop_management_plan.needs_transplant';
  const FOR_COVER = 'crop_management_plan.for_cover';

  const {
    handleSubmit,
    getValues,
    control,
    setValue,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: cloneObject(persistedFormData),
  });

  useHookFormPersist(getValues);

  const variety_id = match?.params?.variety_id;
  const { goBackPath, submitPath, cancelPath } = getTransplantPaths(variety_id);
  const onSubmit = () => {
    history?.push(submitPath);
  };
  const onGoBack = () => history.push(goBackPath);
  const onCancel = () => history.push(cancelPath);

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

      <Label
        style={{
          paddingRight: '10px',
          fontSize: '16px',
          lineHeight: '20px',
          display: 'inline-block',
          marginBottom: '18px',
        }}
      >
        {t('MANAGEMENT_PLAN.IS_TRANSPLANT')}
      </Label>

      <RadioGroup hookFormControl={control} name={TRANSPLANT} required />

      {can_be_cover_crop && (
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
            name={FOR_COVER}
            required={!can_be_cover_crop}
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
    </Form>
  );
}

PureTransplant.prototype = {
  can_be_cover_crop: PropTypes.bool,
  onGoBack: PropTypes.func,
  onCancel: PropTypes.func,
  persistedFormData: PropTypes.object,
  useHookFormPersist: PropTypes.func,
  match: PropTypes.object,
};
