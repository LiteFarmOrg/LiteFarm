import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import Form from '../../Form';
import Button from '../../Form/Button';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { cloneObject } from '../../../util';
import { getBroadcastMethodPaths } from '../getAddManagementPlanPath';
import { PureBroadcastForm } from './PureBroadcastForm';
import PropTypes from 'prop-types';

function PureBroadcastPlan({
  persistedFormData,
  useHookFormPersist,
  system,
  variety_id,
  history,
  locationSize,
  yieldPerArea,
  isFinalPage,
  prefix = `crop_management_plan.planting_management_plans.${isFinalPage ? 'final' : 'initial'}`,
  location,
}) {
  const { t } = useTranslation(['translation']);
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: cloneObject(persistedFormData),
    shouldUnregister: false,
    mode: 'onChange',
  });
  const { historyCancel } = useHookFormPersist(getValues);

  const { submitPath } = useMemo(() => getBroadcastMethodPaths(variety_id, isFinalPage), []);
  const onSubmit = () => history.push(submitPath, location?.state);
  const onGoBack = () => history.back();

  const { already_in_ground, needs_transplant } = persistedFormData.crop_management_plan;
  const isHistoricalPage =
    already_in_ground && ((needs_transplant && !isFinalPage) || !needs_transplant);

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
        onCancel={historyCancel}
        value={isFinalPage ? 75 : 58}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ paddingBottom: '24px' }}>
        {isHistoricalPage
          ? t('BROADCAST_PLAN.HISTORICAL_PERCENTAGE_LOCATION')
          : t('BROADCAST_PLAN.PERCENTAGE_LOCATION')}
      </Main>
      <PureBroadcastForm
        prefix={prefix}
        isFinalPage={isFinalPage}
        locationSize={locationSize}
        yieldPerArea={yieldPerArea}
        system={system}
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

export default PureBroadcastPlan;
PureBroadcastPlan.prototype = {
  system: PropTypes.oneOf(['imperial', 'metric']),
  isFinalPage: PropTypes.bool,
  prefix: PropTypes.string,
  locationSize: PropTypes.number,
  yieldPerArea: PropTypes.number,
};
