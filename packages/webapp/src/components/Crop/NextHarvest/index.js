import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import Button from '../../Form/Button';
import Unit from '../../Form/Unit';
import { Label } from '../../Typography';
import Input from '../../Form/Input';
import { seedYield } from '../../../util/unit';

export default function PureNextHarvest({
  onCancel,
  onGoBack,
  onContinue,
  system,
}) {

  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    setError,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
  });

  const progress = 32;

  const NEXT_HARVEST_DATE = 'next_harvest_date';
  const ESTIMATED_YIELD = 'estimated_yield';
  const ESTIMATED_YIELD_UNIT = 'estimated_yield_unit';

  return (
    <Form
      buttonGroup={
        <Button disabled={!isValid} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onContinue)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={progress}
        style={{
          marginBottom: '24px',
        }}
      />

      <div>
        <Label style={{ marginBottom: '24px' }}>
          {t('MANAGEMENT_PLAN.NEXT_HARVEST')}
        </Label>

        <Input
          style={{ marginBottom: '40px' }}
          type={'date'}
          label={t('common:DATE')}
          hookFormRegister={register(NEXT_HARVEST_DATE, { required: true })}
          errors={errors[NEXT_HARVEST_DATE] && t('common:REQUIRED')}
        />

        <Unit
          register={register}
          label={t('MANAGEMENT_PLAN.ESTIMATED_YIELD')}
          name={ESTIMATED_YIELD}
          displayUnitName={ESTIMATED_YIELD_UNIT}
          errors={errors[ESTIMATED_YIELD]}
          unitType={seedYield}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFormSetError={setError}
          hookFromWatch={watch}
          control={control}
          optional
        />
      </div>
    </Form>
  );
}

PureNextHarvest.prototype = {
  onCancel: PropTypes.func,
  onGoBack: PropTypes.func,
  onContinue: PropTypes.func,
  system: PropTypes.string,
};
