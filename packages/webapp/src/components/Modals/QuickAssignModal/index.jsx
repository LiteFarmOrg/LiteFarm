import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import ModalComponent from '../ModalComponent/v2';
import styles from './styles.module.scss';
import Button from '../../Form/Button';
import ReactSelect from '../../Form/ReactSelect';
import Checkbox from '../../Form/Checkbox';
import Input, { numberOnKeyDown } from '../../Form/Input';
import RadioGroup from '../../Form/RadioGroup';
import { ReactComponent as Person } from '../../../assets/images/task/Person.svg';
import { tasksSelector } from '../../../containers/taskSlice';
import { useSelector } from 'react-redux';
import { Label, Main } from '../../Typography';
import { getCurrencyFromStore } from '../../../store/getFromReduxStore';
import grabCurrencySymbol from '../../../util/grabCurrencySymbol';

const ASSIGNEE = 'assignee';
const HOURLY_WAGE = 'hourly_wage';
const HOURLY_WAGE_ACTION = 'hourly_wage_action';
const ASSIGN_ALL = 'assign_all';
const hourlyWageActions = {
  SET_HOURLY_WAGE: 'set_hourly_wage',
  FOR_THIS_TASK: 'for_this_task',
  NO: 'no',
  DO_NOT_ASK_AGAIN: 'do_not_ask_again',
};

const isYesOptionSelected = (option) => {
  const yesOptions = [hourlyWageActions.SET_HOURLY_WAGE, hourlyWageActions.FOR_THIS_TASK];
  return yesOptions.includes(option);
};

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
  wageAtMoment,
}) {
  const { t } = useTranslation();
  const selfOption = {
    label: `${user.first_name} ${user.last_name}`,
    value: user.user_id,
    wage: user.wage,
  };
  const unAssignedOption = { label: t('TASK.UNASSIGNED'), value: null, isDisabled: false };
  const options = useMemo(() => {
    if (user.is_admin) {
      const options = users
        .map(({ first_name, last_name, user_id, wage, wage_do_not_ask_again }) => ({
          label: `${first_name} ${last_name}`,
          value: user_id,
          wage,
          doNotAskAgain: wage_do_not_ask_again || false,
        }))
        .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));
      unAssignedOption.isDisabled = !isAssigned;
      options.unshift(unAssignedOption);
      return options;
    } else return [selfOption, unAssignedOption];
  }, []);

  const [showHourlyWageSection, setShowHourlyWageSection] = useState(false);
  const [showHourlyWageInput, setShowHourlyWageInput] = useState(false);

  const {
    control,
    register,
    resetField,
    watch,
    formState: { isValid, errors },
  } = useForm({
    mode: 'onTouched',
    defaultValues: {
      [ASSIGNEE]: isAssigned ? unAssignedOption : selfOption,
      [HOURLY_WAGE_ACTION]: '',
      [HOURLY_WAGE]: null,
      [ASSIGN_ALL]: false,
    },
  });

  const selectedWorker = watch(ASSIGNEE);
  const selectedHourlyWageAction = watch(HOURLY_WAGE_ACTION);
  const hourlyWage = watch(HOURLY_WAGE);
  const assignAll = watch(ASSIGN_ALL);

  const tasks = useSelector(tasksSelector);
  const currencySymbol = grabCurrencySymbol(getCurrencyFromStore());

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

    if (isYesOptionSelected(selectedHourlyWageAction)) {
      const wage = +parseFloat(hourlyWage).toFixed(2);

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

  const disabled = !selectedWorker || !isValid;

  useEffect(() => {
    let shouldShowWageSection = false;

    if (user.is_admin && selectedWorker) {
      const assigned = selectedWorker.label !== unAssignedOption.label;

      if (assigned) {
        const { amount } = selectedWorker.wage;
        const hasWage = !!(amount || wageAtMoment);
        shouldShowWageSection = !hasWage && !selectedWorker.doNotAskAgain;
      }
    }
    setShowHourlyWageSection(shouldShowWageSection);
  }, [user.is_admin, selectedWorker, wageAtMoment]);

  useEffect(() => {
    if (!user.is_admin) {
      return;
    }

    resetField(HOURLY_WAGE_ACTION);
    resetField(HOURLY_WAGE);
  }, [user.is_admin, selectedWorker]);

  useEffect(() => {
    let shouldShowWageInput = false;

    if (selectedHourlyWageAction) {
      shouldShowWageInput = isYesOptionSelected(selectedHourlyWageAction);
    }
    if (!shouldShowWageInput) {
      resetField(HOURLY_WAGE);
    }

    setShowHourlyWageInput(shouldShowWageInput);
  }, [selectedHourlyWageAction]);

  const radioOptions = [
    {
      label: t('ADD_TASK.HOURLY_WAGE.SET_HOURLY_WAGE'),
      value: hourlyWageActions.SET_HOURLY_WAGE,
    },
    {
      label: t('ADD_TASK.HOURLY_WAGE.FOR_THIS_TASK'),
      value: hourlyWageActions.FOR_THIS_TASK,
    },
    {
      label: t('common:NO'),
      value: hourlyWageActions.NO,
    },
    {
      label: t('ADD_TASK.HOURLY_WAGE.DONT_ASK'),
      value: hourlyWageActions.DO_NOT_ASK_AGAIN,
    },
  ];

  const renderHourlyWageSection = () => {
    if (!showHourlyWageSection) {
      return;
    }

    return (
      <div className={styles.hourlyWageSection}>
        <Label className={styles.warning} style={{ marginBottom: '24px' }}>
          {t('ADD_TASK.HOURLY_WAGE.ASSIGNEE_WAGE_WARNING', { name: selectedWorker.label })}
        </Label>
        <Main style={{ marginBottom: '10px' }}>
          {t('ADD_TASK.HOURLY_WAGE.WANT_TO_SET_HOURLY_WAGE')}
        </Main>
        <RadioGroup
          hookFormControl={control}
          name={HOURLY_WAGE_ACTION}
          radios={radioOptions}
          data-cy="quickAssign-hourlyWageAction"
          style={{ marginBottom: '10px' }}
        />
        {showHourlyWageInput && (
          <Input
            unit={currencySymbol + t('ADD_TASK.HR')}
            data-cy="quickAssign-hourlyWage"
            label={t('WAGE.HOURLY_WAGE')}
            step="0.01"
            type="number"
            onKeyPress={numberOnKeyDown}
            hookFormRegister={register(HOURLY_WAGE, {
              valueAsNumber: true,
              min: { value: 0, message: t('WAGE.HOURLY_WAGE_RANGE_ERROR') },
              max: { value: 999999999, message: t('WAGE.HOURLY_WAGE_RANGE_ERROR') },
            })}
            style={{ marginBottom: '24px' }}
            errors={errors[HOURLY_WAGE] && (errors[HOURLY_WAGE].message || t('WAGE.ERROR'))}
            toolTipContent={t('WAGE.HOURLY_WAGE_TOOLTIP')}
            optional
          />
        )}
      </div>
    );
  };

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
      <Controller
        control={control}
        name={ASSIGNEE}
        render={({ field: { onChange } }) => (
          <ReactSelect
            data-cy="quickAssign-assignee"
            defaultValue={selectedWorker}
            label={t('ADD_TASK.ASSIGNEE')}
            options={options}
            onChange={onChange}
            style={{ marginBottom: '10px' }}
            isSearchable
          />
        )}
      />
      {renderHourlyWageSection()}
      {/*TODO: properly fix checkbox label overflow ST-272*/}
      {/*TODO: LF-2932 - need to be able to unassign mutiple tasks at once */}
      <Checkbox
        name={ASSIGN_ALL}
        data-cy="quickAssign-assignAll"
        style={{ paddingRight: '24px' }}
        label={t('ADD_TASK.ASSIGN_ALL_TO_PERSON', { name: selectedWorker.label })}
        hookFormRegister={register(ASSIGN_ALL)}
      />
    </ModalComponent>
  );
}
