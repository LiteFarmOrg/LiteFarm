import React from 'react';
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import Form from '../../Form';
import Button from '../../Form/Button';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { cloneObject } from '../../../util';
import { PureBedForm } from './PureBedForm';
import PropTypes from 'prop-types';

function PureBedPlan({
  history,
  system,
  crop_variety,
  useHookFormPersist,
  persistedFormData,
  isFinalPage,
  prefix = `crop_management_plan.planting_management_plans.${isFinalPage ? 'final' : 'initial'}`,
  goBackPath,
  submitPath,
  cancelPath,
  //TODO: always use history.goBack() in management plan flow LF-1972
  onGoBack = () => (goBackPath ? history.push(goBackPath) : history.goBack()),
}) {
  const { t } = useTranslation();
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

  const onSubmit = () => history.push(submitPath);
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
        value={isFinalPage ? 75 : 55}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ paddingBottom: '24px' }}>{t('BED_PLAN.PLANTING_DETAILS')}</Main>

      <PureBedForm
        prefix={prefix}
        isFinalPage={isFinalPage}
        system={system}
        crop_variety={crop_variety}
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

export default PureBedPlan;
PureBedPlan.prototype = {
  crop_variety: PropTypes.object,
  system: PropTypes.oneOf(['imperial', 'metric']),
  isFinalPage: PropTypes.bool,
  prefix: PropTypes.string,
};
