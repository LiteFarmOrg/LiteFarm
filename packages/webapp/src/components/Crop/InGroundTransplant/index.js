import Button from '../../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Label, Main } from '../../Typography';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import RadioGroup from '../../Form/RadioGroup';

export default function PureInGroundTransplant({
  onCancel,
  onGoBack,
  onContinue,
  useHookFormPersist,
  persistedFormData,
}) {
  const { t } = useTranslation();
  

  const progress = 54;
 

  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
  });

  const KNOWS_HOW = 'knows_how_is_crop_planted'; 

  const disabled = !isValid;

  return (
    <Form
      buttonGroup={
        <Button disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onContinue)}
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
        <Label style={{ marginBottom: '18px' }}>
          {t('MANAGEMENT_PLAN.KNOW_HOW_IS_CROP_PLANTED')}
        </Label>
        <RadioGroup
          hookFormControl={control}
          name={KNOWS_HOW}
          required
        />
      </div>
    </Form>
  );
}

PureInGroundTransplant.prototype = {
  onGoBack: PropTypes.func,
  onCancel: PropTypes.func,
  onContinue: PropTypes.func,
  persistedFormData: PropTypes.func,
  useHookFormPersist: PropTypes.func,
};
