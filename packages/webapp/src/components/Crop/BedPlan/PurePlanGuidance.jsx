import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import Form from '../../Form';
import Button from '../../Form/Button';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { cloneObject } from '../../../util';
import { PurePlanGuidanceForm } from './PurePlanGuidanceForm';
import PropTypes from 'prop-types';

function PurePlanGuidance({
  system,
  persistedFormData,
  useHookFormPersist,
  isBed,
  isFinalPage,
  prefix = `crop_management_plan.planting_management_plans.${isFinalPage ? 'final' : 'initial'}`,
  submitPath,
  onSubmit,
}) {
  const { t } = useTranslation(['translation']);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: cloneObject(persistedFormData),
    shouldUnregister: false,
    mode: 'onChange',
  });
  const { historyCancel } = useHookFormPersist(getValues);

  const onFormSubmit = handleSubmit(onSubmit || navigate(submitPath, { state: location.state }));

  return (
    <Form
      buttonGroup={
        <Button data-cy="planGuidance-submit" type={'submit'} disabled={!isValid} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={onFormSubmit}
    >
      <MultiStepPageTitle
        onGoBack={() => navigate(-1)}
        onCancel={historyCancel}
        value={isFinalPage ? 81.25 : 58}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ paddingBottom: '24px' }}>{t('PLAN_GUIDANCE.ADDITIONAL_GUIDANCE')}</Main>

      <PurePlanGuidanceForm
        prefix={prefix}
        isFinalPage={isFinalPage}
        system={system}
        isBed={isBed}
        {...{
          register,
          handleSubmit,
          getValues,
          watch,
          control,
          setValue,
          errors,
        }}
      />
    </Form>
  );
}

export default PurePlanGuidance;
PurePlanGuidance.prototype = {
  system: PropTypes.oneOf(['imperial', 'metric']),
  isFinalPage: PropTypes.bool,
  prefix: PropTypes.string,
  isBed: PropTypes.bool,
};
