import React from 'react';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import Button from '../../Form/Button';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { cloneObject } from '../../../util';
import PropTypes from 'prop-types';
import PureRowForm from './PureRowForm';

export default function PureRowMethod({
  system,
  crop_variety,
  useHookFormPersist,
  persistedFormData,
  isFinalPage,
  history,
  prefix = `crop_management_plan.planting_management_plans.${isFinalPage ? 'final' : 'initial'}`,
  goBackPath,
  submitPath,
  cancelPath,
  //TODO: always use history.goBack() in management plan flow LF-1972
  onGoBack = () => (goBackPath ? history.push(goBackPath) : history.goBack()),
  isHistoricalPage,
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
    shouldUnregister: false,
    mode: 'onChange',
    defaultValues: cloneObject(persistedFormData),
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

      <PureRowForm
        prefix={prefix}
        isFinalPage={isFinalPage}
        system={system}
        crop_variety={crop_variety}
        isHistoricalPage={isHistoricalPage}
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

PureRowMethod.prototype = {
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
  crop_variety: PropTypes.object,
  system: PropTypes.oneOf(['imperial', 'metric']),
  isFinalPage: PropTypes.bool,
  history: PropTypes.object,
  goBackPath: PropTypes.string,
  submitPath: PropTypes.string,
  cancelPath: PropTypes.string,
};
