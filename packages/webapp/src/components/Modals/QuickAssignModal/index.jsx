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
const HOURLY_WAGE_OPTION = 'hourly_wage_option';
const ASSIGN_ALL = 'assign_all';
const hourlyWageOptions = {
  SET_HOURLY_WAGE: 'set_hourly_wage',
  FOR_THIS_TASK: 'for_this_task',
  NO: 'no',
  DO_NOT_ASK_AGAIN: 'do_not_ask_again',
};

const isYesOptionSelected = (option) => {
  const yesOptions = [hourlyWageOptions.SET_HOURLY_WAGE, hourlyWageOptions.FOR_THIS_TASK];
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

  const [hasWage, setHasWage] = useState(false);
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
      [HOURLY_WAGE_OPTION]: '',
      [HOURLY_WAGE]: null,
      [ASSIGN_ALL]: false,
    },
  });

  const selectedWorker = watch(ASSIGNEE);
  const selectedHourlyWageOption = watch(HOURLY_WAGE_OPTION);
  const hourlyWage = watch(HOURLY_WAGE);
  const assignAll = watch(ASSIGN_ALL);

  useEffect(() => {
    if (!user.is_admin || !selectedWorker.wage) {
      return;
    }

    resetField(HOURLY_WAGE_OPTION);
    resetField(HOURLY_WAGE);

    const { amount } = selectedWorker.wage;
    setHasWage(!!(amount || wageAtMoment));
  }, [selectedWorker]);

  useEffect(() => {
    let shouldShow = false;

    if (selectedHourlyWageOption) {
      shouldShow = isYesOptionSelected(selectedHourlyWageOption);
    }

    setShowHourlyWageInput(shouldShow);
  }, [selectedHourlyWageOption]);

  useEffect(() => {
    if (!showHourlyWageInput) {
      resetField(HOURLY_WAGE);
    }
  }, [showHourlyWageInput]);

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

    if (isYesOptionSelected(selectedHourlyWageOption)) {
      const wage = +parseFloat(hourlyWage).toFixed(2);

      if (selectedHourlyWageOption === hourlyWageOptions.SET_HOURLY_WAGE) {
        onUpdateUserFarmWage({ user_id: assigneeUserId, wage: { type: 'hourly', amount: wage } });
      } else if (selectedHourlyWageOption === hourlyWageOptions.FOR_THIS_TASK) {
        onChangeTaskWage(wage);
      }
    } else if (selectedHourlyWageOption === hourlyWageOptions.DO_NOT_ASK_AGAIN) {
      onSetUserFarmWageDoNotAskAgain({ user_id: assigneeUserId });
    }

    dismissModal();
  };

  const unassigned = !selectedWorker || selectedWorker.label === unAssignedOption.label;
  const showHourlyWageSection =
    user.is_admin && !unassigned && !hasWage && !selectedWorker?.doNotAskAgain;

  const radioOptions = [
    {
      label: t('ADD_TASK.SET_HOURLY_WAGE'),
      value: hourlyWageOptions.SET_HOURLY_WAGE,
    },
    {
      label: t('ADD_TASK.FOR_THIS_TASK'),
      value: hourlyWageOptions.FOR_THIS_TASK,
    },
    {
      label: t('common:NO'),
      value: hourlyWageOptions.NO,
    },
    {
      label: t('ADD_TASK.DONT_ASK'),
      value: hourlyWageOptions.DO_NOT_ASK_AGAIN,
    },
  ];

  const disabled = !isValid;

  const renderHourlyRangeSection = () => {
    if (!showHourlyWageSection) {
      return;
    }

    return (
      <>
        <Label className={styles.warning} style={{ marginBottom: 24 }}>
          {t('ADD_TASK.ASSIGNEE_WAGE_WARNING', { name: selectedWorker.label })}
        </Label>
        <Main style={{ marginBottom: 10 }}>{t('ADD_TASK.WANT_TO_SET_HOURLY_WAGE')}</Main>
        <RadioGroup
          hookFormControl={control}
          name={HOURLY_WAGE_OPTION}
          radios={radioOptions}
          data-cy="roleSelection-role"
          style={{ marginBottom: 10 }}
        />
        {showHourlyWageInput && (
          <Input
            unit={currencySymbol + t('ADD_TASK.HR')}
            data-cy="hourly-wage"
            label={t('WAGE.HOURLY_WAGE')}
            step="0.01"
            type="number"
            onKeyPress={numberOnKeyDown}
            hookFormRegister={register(HOURLY_WAGE, {
              min: { value: 0, message: t('WAGE.HOURLY_WAGE_RANGE_ERROR') },
              valueAsNumber: true,
              max: { value: 999999999, message: t('WAGE.HOURLY_WAGE_RANGE_ERROR') },
            })}
            style={{ marginBottom: '24px' }}
            errors={
              errors[HOURLY_WAGE] && (errors[HOURLY_WAGE].message || t('WAGE.HOURLY_WAGE_ERROR'))
            }
            toolTipContent={t('WAGE.HOURLY_WAGE_TOOLTIP')}
            optional
          />
        )}
      </>
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
            style={{ marginBottom: 10 }}
            isSearchable
          />
        )}
      />
      {renderHourlyRangeSection()}
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
