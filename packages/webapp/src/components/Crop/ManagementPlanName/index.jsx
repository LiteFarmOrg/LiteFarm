import Button from '../../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Input, { getInputErrors } from '../../Form/Input';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import InputAutoSize from '../../Form/InputAutoSize';
import { cloneObject } from '../../../util';

export default function PureManagementPlanName({
  onSubmit,
  onError,
  match,
  history,
  persistedFormData,
  useHookFormPersist,
  managementPlanCount,
}) {
  const { t } = useTranslation();
  const variety_id = match?.params?.variety_id;

  const NAME = 'name';
  const NOTES = 'notes';

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      [NAME]: t('MANAGEMENT_PLAN.PLAN_AND_ID', { id: managementPlanCount }),
      ...cloneObject(persistedFormData),
    },
  });
  const { historyCancel } = useHookFormPersist(getValues);

  const onGoBack = () => history.back();

  const disabled = !isValid;

  return (
    <Form
      buttonGroup={
        <Button data-cy="cropPlan-save" disabled={disabled} fullLength>
          {t('common:SAVE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={historyCancel}
        cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={87.5}
        style={{ marginBottom: '24px' }}
      />

      <Input
        data-cy="cropPlan-name"
        style={{ marginBottom: '40px' }}
        label={t('MANAGEMENT_PLAN.PLAN_NAME')}
        hookFormRegister={register(NAME, { required: true })}
        errors={getInputErrors(errors, NAME)}
      />

      <InputAutoSize
        style={{ marginBottom: '40px' }}
        label={t('MANAGEMENT_PLAN.PLAN_NOTES')}
        hookFormRegister={register(NOTES, {
          maxLength: { value: 10000, message: t('MANAGEMENT_PLAN.NOTES_CHAR_LIMIT') },
        })}
        optional
        errors={errors[NOTES]?.message}
      />
    </Form>
  );
}

PureManagementPlanName.prototype = {
  history: PropTypes.object,
  match: PropTypes.object,
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
  managementPlanCount: PropTypes.number,
};
