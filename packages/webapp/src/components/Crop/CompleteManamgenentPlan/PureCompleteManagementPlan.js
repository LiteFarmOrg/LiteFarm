import Form from '../../Form';
import CropHeader from '../cropHeader';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Button from '../../Form/Button';
import { useTranslation } from 'react-i18next';
import { Title } from '../../Typography';
import ReactSelect from '../../Form/ReactSelect';
import Rating from '../../Rating';
import InputAutoSize from '../../Form/InputAutoSize';
import Input from '../../Form/Input';
import { getDateInputFormat } from '../../../util/moment';
import AbandonManagementPlanModal from '../../Modals/AbandonManagementPlanModal';
import { getProcessedFormData } from '../../../containers/hooks/useHookFormPersist/utils';

export function PureCompleteManagementPlan({
  onGoBack,
  crop_variety,
  onSubmit,
  isAbandonPage,
  reasonOptions,
}) {
  const { t } = useTranslation();
  const DATE = isAbandonPage ? 'abandon_date' : 'complete_date';
  const ABANDON_REASON = 'abandon_reason';
  const RATING = 'rating';
  const NOTES = 'complete_notes';
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: { [DATE]: getDateInputFormat(new Date()) },
  });

  const [showAbandonModal, setShowAbandonModal] = useState(false);

  const disabled = !isValid;
  return (
    <Form
      buttonGroup={
        <Button disabled={disabled} fullLength>
          {isAbandonPage ? t('common:MARK_ABANDON') : t('common:MARK_COMPLETE')}
        </Button>
      }
      onSubmit={handleSubmit(isAbandonPage ? () => setShowAbandonModal(true) : onSubmit)}
    >
      <CropHeader {...crop_variety} onBackClick={onGoBack} />
      <Title
        style={{
          marginTop: '24px',
          marginBottom: '32px',
        }}
      >
        {isAbandonPage
          ? t('MANAGEMENT_PLAN.COMPLETE_PLAN.ABANDON_PLAN')
          : t('MANAGEMENT_PLAN.COMPLETE_PLAN.COMPLETE_PLAN')}
      </Title>
      <Input
        style={{ marginBottom: '40px' }}
        label={t('MANAGEMENT_PLAN.COMPLETE_PLAN.DATE_OF_CHANGE')}
        hookFormRegister={register(DATE)}
        type={'date'}
        required
      />
      {isAbandonPage && (
        <Controller
          control={control}
          name={ABANDON_REASON}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <ReactSelect
              label={t('MANAGEMENT_PLAN.COMPLETE_PLAN.ABANDON_REASON')}
              options={reasonOptions}
              onChange={(e) => {
                onChange(e);
              }}
              value={value}
              style={{ marginBottom: '40px' }}
              creatable
            />
          )}
        />
      )}
      <Controller
        control={control}
        name={RATING}
        render={({ field: { onChange, onBlur, value } }) => (
          <Rating
            stars={value}
            onRate={onChange}
            style={{ marginBottom: '40px' }}
            optional
            label={t('MANAGEMENT_PLAN.COMPLETE_PLAN.RATING')}
          />
        )}
      />
      <InputAutoSize
        style={{ marginBottom: '40px' }}
        label={t('MANAGEMENT_PLAN.PLAN_NOTES')}
        hookFormRegister={register(NOTES)}
        optional
      />
      {showAbandonModal && isAbandonPage && (
        <AbandonManagementPlanModal
          dismissModal={() => setShowAbandonModal(false)}
          onAbandon={() => onSubmit(getProcessedFormData(getValues()))}
        />
      )}
    </Form>
  );
}
