import Button from '../../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Input from '../../Form/Input';
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
}) {
  const { t } = useTranslation();
  const variety_id = match?.params?.variety_id;
  const goBackPath = `/crop/${variety_id}/add_management_plan/${persistedFormData?.planting_type?.toLowerCase()}`;
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
    defaultValues: cloneObject(persistedFormData),
  });
  useHookFormPersist([goBackPath], getValues);
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
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={87.5}
        style={{ marginBottom: '24px' }}
      />

      <Input
        style={{ marginBottom: '40px' }}
        label={t('common:NAME')}
        hookFormRegister={register(NAME, { required: true })}
      />

      <InputAutoSize
        style={{ marginBottom: '40px' }}
        label={t('common:NOTES')}
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
};
