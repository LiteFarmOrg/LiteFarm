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
import { cloneObject } from '../../../util';
import styles from './styles.module.scss';

export default function PureNextHarvest({
  onCancel,
  onGoBack,
  onContinue,
  system,
  persistedFormData,
  useHookFormPersist,
  variety,
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
    defaultValues: cloneObject(persistedFormData),
  });

  const progress = 32;

  const NEXT_HARVEST_DATE = 'next_harvest_date';
  const ESTIMATED_YIELD = 'estimated_yield';
  const ESTIMATED_YIELD_UNIT = 'estimated_yield_unit';

  const submitPath = `/crop/${variety}/add_management_plan/choose_planting_location`;
  const goBackPath = `/crop/${variety}/add_management_plan/needs_transplant`;

  const today = new Date();
  const todayStr = today.toISOString().substring(0, 10);

  useHookFormPersist([submitPath, goBackPath], getValues);

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
        <Label className={styles.label} style={{ marginBottom: '24px' }}>
          {t('MANAGEMENT_PLAN.NEXT_HARVEST')}
        </Label>

        <Input
          style={{ marginBottom: '40px' }}
          type={'date'}
          label={t('common:DATE')}
          hookFormRegister={register(NEXT_HARVEST_DATE, {
            required: true,
          })}
          errors={errors[NEXT_HARVEST_DATE] && t('common:REQUIRED')}
          minDate={todayStr}
        />

        <Unit
          register={register}
          label={t('MANAGEMENT_PLAN.ESTIMATED_YIELD')}
          name={ESTIMATED_YIELD}
          displayUnitName={ESTIMATED_YIELD_UNIT}
          unitType={seedYield}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFormSetError={setError}
          hookFromWatch={watch}
          control={control}
          max={999}
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
  persistedFormData: PropTypes.object,
  useHookFormPersist: PropTypes.func,
  variety: PropTypes.string,
};
