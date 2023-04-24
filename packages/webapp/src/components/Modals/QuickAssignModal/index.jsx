import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import styles from './styles.module.scss';
import Button from '../../Form/Button';
import Checkbox from '../../Form/Checkbox';
import { ReactComponent as Person } from '../../../assets/images/task/Person.svg';
import { tasksSelector } from '../../../containers/taskSlice';
import { useSelector } from 'react-redux';
import AssignTask from '../../Task/AssignTask';
import useTaskAssignForm from '../../Task/AssignTask/useTaskAssignForm';
import { hourlyWageActions, ASSIGN_ALL } from '../../Task/AssignTask/constants';

export default function TaskQuickAssignModal({
  dismissModal,
  task_id,
  due_date,
  isAssigned,
  onAssignTasksOnDate,
  onAssignTask,
  onUpdateUserFarmWage,
  onChangeTaskWage,
  onSetUserFarmWageDoNotAskAgain,
  users,
  user,
  wage_at_moment,
}) {
  const { t } = useTranslation();

  const defaultAssignee = useMemo(() => {
    return isAssigned
      ? { label: t('TASK.UNASSIGNED'), value: null, isDisabled: false }
      : {
          label: `${user.first_name} ${user.last_name}`,
          value: user.user_id,
        };
  }, [isAssigned, user]);

  const {
    control,
    register,
    watch,
    errors,
    disabled,
    assigneeOptions,
    selectedWorker,
    selectedHourlyWageAction,
    hourlyWage,
    currency,
    showHourlyWageInputs,
    shouldSetWage,
  } = useTaskAssignForm({
    user,
    users,
    additionalFields: { [ASSIGN_ALL]: false },
    wage_at_moment,
    defaultAssignee,
    disableUnAssignedOption: !isAssigned,
  });

  const assignAll = watch(ASSIGN_ALL);

  const tasks = useSelector(tasksSelector);

  const checkUnassignedTaskForSameDate = () => {
    const selectedTask = tasks.find((t) => t.task_id == task_id);
    let isUnassignedTaskPresent = false;
    for (let task of tasks) {
      if (
        task.due_date === selectedTask.due_date &&
        !task.assignee &&
        task.task_id !== task_id &&
        task.complete_date === null
      ) {
        isUnassignedTaskPresent = true;
        break;
      }
    }
    return isUnassignedTaskPresent;
  };

  const onAssign = () => {
    const assigneeUserId = selectedWorker.value;

    assignAll && checkUnassignedTaskForSameDate() && assigneeUserId !== null
      ? onAssignTasksOnDate({
          task_id: task_id,
          date: due_date,
          assignee_user_id: assigneeUserId,
        })
      : onAssignTask({
          task_id: task_id,
          assignee_user_id: assigneeUserId,
        });

    if (shouldSetWage) {
      const wage = +hourlyWage.toFixed(2);

      if (selectedHourlyWageAction === hourlyWageActions.SET_HOURLY_WAGE) {
        onUpdateUserFarmWage({ user_id: assigneeUserId, wage: { type: 'hourly', amount: wage } });
      } else if (selectedHourlyWageAction === hourlyWageActions.FOR_THIS_TASK) {
        onChangeTaskWage(wage);
      }
    } else if (selectedHourlyWageAction === hourlyWageActions.DO_NOT_ASK_AGAIN) {
      onSetUserFarmWageDoNotAskAgain({ user_id: assigneeUserId });
    }

    dismissModal();
  };

  {
    /*TODO: properly fix checkbox label overflow ST-272*/
    /*TODO: LF-2932 - need to be able to unassign mutiple tasks at once */
  }
  const assignAllCheckbox = useMemo(() => {
    return (
      <Checkbox
        name={ASSIGN_ALL}
        data-cy="quickAssign-assignAll"
        style={{ paddingRight: '24px' }}
        label={t('ADD_TASK.ASSIGN_ALL_TO_PERSON', { name: selectedWorker.label })}
        hookFormRegister={register(ASSIGN_ALL)}
      />
    );
  }, [selectedWorker.label]);

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('ADD_TASK.ASSIGN_TASK')}
      buttonGroup={
        <>
          <Button onClick={dismissModal} className={styles.button} color="secondary" sm>
            {t('common:CANCEL')}
          </Button>

          <Button
            data-cy="quickAssign-update"
            onClick={onAssign}
            disabled={disabled}
            className={styles.button}
            color="primary"
            sm
          >
            {t('common:UPDATE')}
          </Button>
        </>
      }
      icon={<Person />}
    >
      <AssignTask
        assigneeOptions={assigneeOptions}
        control={control}
        selectedWorker={selectedWorker}
        optional={true}
        additionalContent={assignAllCheckbox}
        register={register}
        errors={errors}
        showHourlyWageInputs={showHourlyWageInputs}
        shouldSetWage={shouldSetWage}
        currency={currency}
      />
    </ModalComponent>
  );
}
