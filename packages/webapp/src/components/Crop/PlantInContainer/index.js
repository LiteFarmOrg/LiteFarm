import Button from '../../Form/Button';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { cloneObject } from '../../../util';
import PureContainerForm from './PureContainerForm';

export default function PurePlantInContainer({
  useHookFormPersist,
  persistedFormData,
  system,
  history,
  crop_variety,
  isFinalPage,
  isHistorical,
  prefix = `crop_management_plan.planting_management_plans.${isFinalPage ? 'final' : 'initial'}`,
  goBackPath,
  submitPath,
  cancelPath,
  //TODO: always use history.goBack() in management plan flow LF-1972
  onSubmit = () => history.push(submitPath),
  onGoBack = () => (goBackPath ? history.push(goBackPath) : history.goBack()),
}) {
  const progress = useMemo(() => {
    if (isHistorical && !isFinalPage) return 55;
    if (isFinalPage) return 75;
    return 50;
  }, []);

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
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: cloneObject(persistedFormData),
  });
  useHookFormPersist(getValues);

  const onCancel = () => history.push(cancelPath);
  const onError = () => {};

  const disabled = !isValid;

  return (
    <Form
      buttonGroup={
        <Button disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={progress}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ marginBottom: '24px' }}>
        {isHistorical
          ? t('MANAGEMENT_PLAN.HISTORICAL_CONTAINER_OR_IN_GROUND')
          : t('MANAGEMENT_PLAN.CONTAINER_OR_IN_GROUND')}
      </Main>
      <PureContainerForm
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

PurePlantInContainer.prototype = {
  history: PropTypes.object,
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
  crop_variety: PropTypes.object,
  system: PropTypes.oneOf(['imperial', 'metric']),
};
