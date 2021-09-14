import React from 'react';
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
  history,
  goBackPath,
  submitPath,
  cancelPath,
  //TODO: always use history.goBack() in management plan flow LF-1972
  onGoBack = () => (goBackPath ? history.push(goBackPath) : history.goBack()),
  onSubmit = () => history.push(submitPath),
}) {
  const { t } = useTranslation(['translation']);
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
  useHookFormPersist(getValues);

  const onCancel = () => history.push(cancelPath);

  return (
    <Form
      buttonGroup={
        <Button type={'submit'} disabled={!isValid} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
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
