import React, { useMemo } from 'react';
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
import { getNextHarvestPaths } from '../getAddManagementPlanPath';

export default function PureNextHarvest({
  system,
  persistedFormData,
  useHookFormPersist,
  variety_id,
  history,
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
  useHookFormPersist(getValues);

  const progress = 37.5;

  const NEXT_HARVEST_DATE = 'crop_management_plan.harvest_date';
  const ESTIMATED_YIELD = 'crop_management_plan.planting_management_plans.final.estimated_yield';
  const ESTIMATED_YIELD_UNIT =
    'crop_management_plan.planting_management_plans.final.estimated_yield_unit';

  const { goBackPath, submitPath, cancelPath } = useMemo(
    () => getNextHarvestPaths(variety_id, persistedFormData),
    [],
  );
  const onSubmit = () => history.push(submitPath);
  const onGoBack = () => history.push(goBackPath);
  const onCancel = () => history.push(cancelPath);

  const showEstimatedYield = !persistedFormData.crop_management_plan.for_cover;

  const today = new Date();
  const todayStr = today.toISOString().substring(0, 10);

  return (
    <Form
      buttonGroup={
        <Button disabled={!isValid} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit)}
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
        {showEstimatedYield && (
          <Unit
            register={register}
            label={t('MANAGEMENT_PLAN.ESTIMATED_YIELD')}
            name={ESTIMATED_YIELD}
            displayUnitName={ESTIMATED_YIELD_UNIT}
            unitType={seedYield}
            system={system}
            hookFormSetValue={setValue}
            hookFormGetValue={getValues}
            hookFromWatch={watch}
            control={control}
            max={999}
            optional
          />
        )}
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
  variety_id: PropTypes.string,
};
