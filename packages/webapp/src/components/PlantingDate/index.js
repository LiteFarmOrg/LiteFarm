import Button from '../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Text } from '../Typography';
import Input from '../Form/Input';
import Form from '../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';

export default function PurePlantingDate({ onSubmit, onError, onGoBack, onCancel }) {
  const { t } = useTranslation(['translation', 'common', 'crop']);
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
  });

  const SEED_DATE = 'seed_date';
  const GERMINATION_DAYS = 'germination_days';
  const HARVEST_DAYS = 'harvest_days';
  const TERMINATION_DAYS = 'termination_days';
  const TRANSPLANT_DAYS = 'transplant_days';

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
      <Text>{t('MANAGEMENT_PLAN.PLANTING_DATE')}</Text>
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={15}
      />
      <Input type={'date'} label={t('common:DATE')} hookFormRegister={register(SEED_DATE)} />
    </Form>
  );
}

PurePlantingDate.prototype = {
  history: PropTypes.object,
  match: PropTypes.object,
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
};
