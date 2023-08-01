import Form from '../../Form';
import CropHeader from '../CropHeader';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Button from '../../Form/Button';
import { useTranslation } from 'react-i18next';
import { Title } from '../../Typography';
import ReactSelect from '../../Form/ReactSelect';
import Rating from '../../Rating';
import InputAutoSize from '../../Form/InputAutoSize';
import Input, { getInputErrors } from '../../Form/Input';
import { StatusLabel } from '../../CardWithStatus/StatusLabel';
import { managementPlanStatusTranslateKey } from '../../CardWithStatus/ManagementPlanCard/ManagementPlanCard';
import { getDateInputFormat } from '../../../util/moment';
import AbandonManagementPlanModal from '../../Modals/AbandonManagementPlanModal';
import i18n from '../../../locales/i18n';
import { isNotInFuture } from '../../Form/Input/utils';

export const SOMETHING_ELSE = 'Something Else';
export const defaultAbandonManagementPlanReasonOptions = [
  { label: i18n.t('MANAGEMENT_PLAN.COMPLETE_PLAN.REASON.CROP_FAILURE'), value: 'CROP_FAILURE' },
  { label: i18n.t('MANAGEMENT_PLAN.COMPLETE_PLAN.REASON.LABOUR_ISSUE'), value: 'LABOUR_ISSUE' },
  { label: i18n.t('MANAGEMENT_PLAN.COMPLETE_PLAN.REASON.MARKET_PROBLEM'), value: 'MARKET_PROBLEM' },
  { label: i18n.t('MANAGEMENT_PLAN.COMPLETE_PLAN.REASON.WEATHER'), value: 'WEATHER' },
  {
    label: i18n.t('MANAGEMENT_PLAN.COMPLETE_PLAN.REASON.MACHINERY_ISSUE'),
    value: 'MACHINERY_ISSUE',
  },
  {
    label: i18n.t('MANAGEMENT_PLAN.COMPLETE_PLAN.REASON.SCHEDULING_ISSUE'),
    value: 'SCHEDULING_ISSUE',
  },
  { label: i18n.t('MANAGEMENT_PLAN.COMPLETE_PLAN.REASON.SOMETHING_ELSE'), value: SOMETHING_ELSE },
];

export function PureCompleteManagementPlan({
  onGoBack,
  crop_variety,
  onSubmit,
  isAbandonPage,
  reasonOptions,
  start_date,
  status,
}) {
  const { t } = useTranslation();
  const DATE = isAbandonPage ? 'abandon_date' : 'complete_date';

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

  const ABANDON_REASON = 'abandon_reason';
  const abandon_reason = watch(ABANDON_REASON);
  const CREATED_ABANDON_REASON = 'created_abandon_reason';

  const [showAbandonModal, setShowAbandonModal] = useState(false);

  const completed = status === 'completed';
  const abandoned = status === 'abandoned';

  const disabled = !isValid;

  return (
    <Form
      buttonGroup={
        completed || abandoned ? null : (
          <Button disabled={disabled} fullLength>
            {isAbandonPage ? t('common:MARK_ABANDON') : t('common:MARK_COMPLETE')}
          </Button>
        )
      }
      onSubmit={handleSubmit(isAbandonPage ? () => setShowAbandonModal(true) : onSubmit)}
    >
      <CropHeader variety={crop_variety} onBackClick={onGoBack} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
        {(completed || abandoned) && (
          <StatusLabel
            style={{
              marginTop: '24px',
              marginBottom: '32px',
            }}
            label={t(`MANAGEMENT_PLAN.STATUS.${managementPlanStatusTranslateKey[status]}`)}
            color={status}
          />
        )}
      </div>
      <Input
        style={{ marginBottom: '40px' }}
        label={t('MANAGEMENT_PLAN.COMPLETE_PLAN.DATE_OF_CHANGE')}
        hookFormRegister={register(DATE, {
          required: true,
          validate: isNotInFuture,
        })}
        errors={getInputErrors(errors, DATE)}
        type={'date'}
        max={getDateInputFormat()}
        min={start_date}
        disabled={completed || abandoned}
        required
      />
      {isAbandonPage && (
        <>
          <Controller
            control={control}
            name={ABANDON_REASON}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <ReactSelect
                label={t('MANAGEMENT_PLAN.COMPLETE_PLAN.ABANDON_REASON')}
                options={[...defaultAbandonManagementPlanReasonOptions, ...reasonOptions]}
                onChange={(e) => {
                  onChange(e);
                }}
                isDisabled={abandoned}
                value={value}
                style={{ marginBottom: '40px' }}
                placeholder={t(`common:SELECT`)}
              />
            )}
          />
          {abandon_reason?.value === SOMETHING_ELSE && (
            <Input
              style={{ marginBottom: '40px' }}
              label={t('MANAGEMENT_PLAN.COMPLETE_PLAN.WHAT_HAPPENED')}
              disabled={abandoned}
              hookFormRegister={register(CREATED_ABANDON_REASON)}
              optional
            />
          )}
        </>
      )}
      <Controller
        control={control}
        name={RATING}
        render={({ field: { onChange, onBlur, value } }) => (
          <Rating
            stars={value}
            onRate={onChange}
            style={{ marginBottom: '40px' }}
            disabled={completed || abandoned}
            optional
            label={t('MANAGEMENT_PLAN.COMPLETE_PLAN.RATING')}
          />
        )}
      />
      <InputAutoSize
        style={{ marginBottom: '40px' }}
        label={t('MANAGEMENT_PLAN.COMPLETION_NOTES')}
        hookFormRegister={register(NOTES, {
          maxLength: { value: 10000, message: t('MANAGEMENT_PLAN.COMPLETE_PLAN.NOTES_CHAR_LIMIT') },
        })}
        optional
        disabled={completed || abandoned}
        errors={errors[NOTES]?.message}
      />
      {showAbandonModal && isAbandonPage && (
        <AbandonManagementPlanModal
          dismissModal={() => setShowAbandonModal(false)}
          onAbandon={() => onSubmit(getValues())}
        />
      )}
    </Form>
  );
}
