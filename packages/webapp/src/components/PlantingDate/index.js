import Button from '../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Main } from '../Typography';
import Input from '../Form/Input';
import Form from '../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import InputDuration from '../Form/InputDuration';
import { getDateInputFormat } from '../LocationDetailLayout/utils';
import Infoi from '../Tooltip/Infoi';

export default function PurePlantingDate({
  onSubmit,
  onError,
  onGoBack,
  onCancel,
  useHookFormPersist,
}) {
  const { t } = useTranslation();
  const SEED_DATE = 'seed_date';
  const GERMINATION_DAYS = 'germination_days';
  const HARVEST_DAYS = 'harvest_days';
  const TERMINATION_DAYS = 'termination_days';
  const TRANSPLANT_DAYS = 'transplant_days';
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: {
      [SEED_DATE]: getDateInputFormat(new Date()),
    },
  });

  const seed_date = watch(SEED_DATE);

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
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={15}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ marginBottom: '24px' }}>{t('MANAGEMENT_PLAN.PLANTING_DATE')}</Main>

      <Input
        style={{ marginBottom: '40px' }}
        type={'date'}
        label={t('common:DATE')}
        hookFormRegister={register(SEED_DATE)}
      />
      <Main style={{ marginBottom: '24px' }}>
        {t('MANAGEMENT_PLAN.DAYS_FROM_SEEDING')}{' '}
        <Infoi style={{ marginLeft: '4px' }} content={t('MANAGEMENT_PLAN.DURATION_TOOLTIP')} />
      </Main>
      <InputDuration
        style={{ marginBottom: '40px' }}
        startDate={seed_date}
        hookformWatch={watch}
        hookFormRegister={register(GERMINATION_DAYS)}
        label={t('MANAGEMENT_PLAN.GERMINATION')}
      />
      <InputDuration
        style={{ marginBottom: '40px' }}
        startDate={seed_date}
        hookformWatch={watch}
        hookFormRegister={register(HARVEST_DAYS)}
        label={t('MANAGEMENT_PLAN.HARVEST')}
      />
      <InputDuration
        style={{ marginBottom: '40px' }}
        startDate={seed_date}
        hookformWatch={watch}
        hookFormRegister={register(TERMINATION_DAYS)}
        label={t('MANAGEMENT_PLAN.TERMINATION')}
      />
      <InputDuration
        style={{ marginBottom: '40px' }}
        startDate={seed_date}
        hookformWatch={watch}
        hookFormRegister={register(TRANSPLANT_DAYS)}
        label={t('MANAGEMENT_PLAN.TRANSPLANT')}
      />
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
