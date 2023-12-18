import Button from '../../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Input, { getInputErrors } from '../../Form/Input';
import Form from '../../Form';
import Checkbox from '../../Form/Checkbox';
import { useSelector } from 'react-redux';
import { userFarmsByFarmSelector, userFarmSelector } from '../../../containers/userFarmSlice';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import InputAutoSize from '../../Form/InputAutoSize';
import AssignTask from '../../Task/AssignTask';
import useTaskAssignForm from '../../Task/AssignTask/useTaskAssignForm';
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

  const NAME = 'name';
  const NOTES = 'notes';
  const REPEAT_CROP_PLAN = 'repeat_crop_plan';

  const users = useSelector(userFarmsByFarmSelector).filter((user) => user.status !== 'Inactive');
  const user = useSelector(userFarmSelector);

  const unassigned = { label: t('TASK.UNASSIGNED'), value: null, isDisabled: false };

  const {
    register,
    handleSubmit,
    getValues,
    assigneeOptions,
    selectedWorker,
    control,
    errors,
    isValid,
  } = useTaskAssignForm({
    mode: 'onChange',
    shouldUnregister: false,
    user: user,
    users: users,
    defaultAssignee:
      users.length === 1
        ? { label: `${user.first_name} ${user.last_name}`, value: user.user_id, isDisabled: false }
        : unassigned,
    additionalFields: {
      [NAME]: t('MANAGEMENT_PLAN.PLAN_AND_ID', { id: managementPlanCount }),
      ...cloneObject(persistedFormData),
    },
  });
  const { historyCancel } = useHookFormPersist(getValues);

  const onGoBack = () => history.back();

  const disabled = !isValid;

  const [showRepeatPlanSubText, setShowRepeatPlanSubText] = React.useState(false);

  return (
    <Form
      buttonGroup={
        <Button data-cy="cropPlan-save" disabled={disabled} fullLength>
          {t('common:SAVE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={historyCancel}
        cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={87.5}
        style={{ marginBottom: '24px' }}
      />

      <Input
        style={{ marginBottom: '24px' }}
        label={t('MANAGEMENT_PLAN.PLAN_NAME')}
        hookFormRegister={register(NAME, { required: true })}
        errors={getInputErrors(errors, NAME)}
      />

      <AssignTask
        assigneeOptions={assigneeOptions}
        control={control}
        selectedWorker={selectedWorker}
        optional={true}
        register={register}
        errors={errors}
        toolTipContent={t('MANAGEMENT_PLAN.ASSIGN_ALL_TASKS')}
      />

      <InputAutoSize
        style={{ marginBottom: '40px' }}
        label={t('MANAGEMENT_PLAN.PLAN_NOTES')}
        hookFormRegister={register(NOTES, {
          maxLength: { value: 10000, message: t('MANAGEMENT_PLAN.NOTES_CHAR_LIMIT') },
        })}
        optional
        errors={errors[NOTES]?.message}
      />

      <Checkbox
        label={t('MANAGEMENT_PLAN.CROP_PLAN_REPEAT')}
        hookFormRegister={register(REPEAT_CROP_PLAN)}
        onChange={() => setShowRepeatPlanSubText(!showRepeatPlanSubText)}
      />
      {showRepeatPlanSubText && <span>{t('MANAGEMENT_PLAN.CROP_PLAN_REPEAT_SUBTEXT')}</span>}
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
