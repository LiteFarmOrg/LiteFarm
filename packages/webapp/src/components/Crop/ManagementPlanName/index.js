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
  const goBackPaths = {
    rows: 'row_guidance',
    bed_plan: 'bed_guidance',
    container: 'container_method',
    broadcast: 'broadcast_method',
  };

  const goBackPath = `/crop/${variety_id}/add_management_plan/${
    goBackPaths[persistedFormData?.planting_type?.toLowerCase()]
  }`;
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
  useHookFormPersist(getValues);
  const onGoBack = () => {
    history?.push(goBackPath);
  };
  const onCancel = () => {
    history?.push(`/crop/${variety_id}/management`);
  };
  const disabled = !isValid;

  return (
    <Form
      buttonGroup={
        <Button disabled={disabled} fullLength>
          {t('common:SAVE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={87.5}
        style={{ marginBottom: '24px' }}
      />

      <Input
        style={{ marginBottom: '40px' }}
        label={t('MANAGEMENT_PLAN.PLAN_NAME')}
        hookFormRegister={register(NAME, { required: true })}
        errors={getInputErrors(errors, NAME)}
      />

      <InputAutoSize
        style={{ marginBottom: '40px' }}
        label={t('MANAGEMENT_PLAN.PLAN_NOTES')}
        hookFormRegister={register(NOTES)}
        optional
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
