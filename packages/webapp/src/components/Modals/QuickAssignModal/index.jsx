import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
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

const HOURLY_WAGE = 'hourly_wage';
const HOURLY_WAGE_OPTION = 'hourly_wage_option';
const hourlyWageOptions = {
  SET_HOURLY_WAGE: 'set_hourly_wage',
  FOR_THIS_TASK: 'for_this_task',
  NO: 'no',
  DO_NOT_ASK_AGAIN: 'do_not_ask_agaiin',
};

export default function TaskQuickAssignModal({
  dismissModal,
  task_id,
  due_date,
  isAssigned,
  onAssignTasksOnDate,
  onAssignTask,
  users,
  user,
}) {
  const { t } = useTranslation();
  const selfOption = { label: `${user.first_name} ${user.last_name}`, value: user.user_id };
  const unAssignedOption = { label: t('TASK.UNASSIGNED'), value: null, isDisabled: false };
  const options = useMemo(() => {
    if (user.is_admin) {
      const options = users
        .map(({ first_name, last_name, user_id }) => ({
          label: `${first_name} ${last_name}`,
          value: user_id,
        }))
        .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));
      unAssignedOption.isDisabled = !isAssigned;
      options.unshift(unAssignedOption);
      return options;
    } else return [selfOption, unAssignedOption];
  }, []);

  const [selectedWorker, setWorker] = useState(isAssigned ? unAssignedOption : selfOption);
  const [assignAll, setAssignAll] = useState(false);

  const tasks = useSelector(tasksSelector);
  const {
    control,
    register,
    watch,
    formState: { isValid, isDirty, errors },
  } = useForm({
    mode: 'onTouched',
    defaultValues: {
      [HOURLY_WAGE_OPTION]: '',
      [HOURLY_WAGE]: null,
    },
  });
  const currencySymbol = grabCurrencySymbol(getCurrencyFromStore());

  const override = watch(HOURLY_WAGE_OPTION);
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
    // TODO: update
    assignAll && checkUnassignedTaskForSameDate() && selectedWorker.value !== null
      ? onAssignTasksOnDate({
          task_id: task_id,
          date: due_date,
          assignee_user_id: selectedWorker.value,
        })
      : onAssignTask({
          task_id: task_id,
          assignee_user_id: selectedWorker.value,
        });
    dismissModal();
  };

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

  const onCheckedAll = () => {
    setAssignAll(!assignAll);
  };

  const disabled = selectedWorker === null || !isValid || !isDirty;

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
      <ReactSelect
        data-cy="quickAssign-assignee"
        defaultValue={selectedWorker}
        label={t('ADD_TASK.ASSIGNEE')}
        options={options}
        onChange={setWorker}
        style={{ marginBottom: 10 }}
        isSearchable
      />
      <Label className={styles.warning} style={{ marginBottom: 24 }}>
        {t('ADD_TASK.ASSIGNEE_WAGE_WARNING', { name: selectedWorker.label })}
      </Label>
      <Main style={{ marginBottom: 10 }}>{t('ADD_TASK.DO_YOU_WANT_TO_SET_HOURLY_WAGE')}</Main>
      <RadioGroup
        hookFormControl={control}
        name={HOURLY_WAGE_OPTION}
        radios={radioOptions}
        data-cy="roleSelection-role"
        style={{ marginBottom: 10 }}
      />
      <Input
        unit={currencySymbol + t('ADD_TASK.HR')}
        data-cy="hourly-wage"
        label={t('WAGE.HOURLY_WAGE')}
        step="0.01"
        type="number"
        onKeyPress={numberOnKeyDown}
        hookFormRegister={register(HOURLY_WAGE, {
          min: { value: 0, message: t('WAGE.RANGE_ERROR') },
          valueAsNumber: true,
          max: { value: 999999999, message: t('WAGE.RANGE_ERROR') },
        })}
        style={{ marginBottom: '24px' }}
        errors={errors[HOURLY_WAGE] && (errors[HOURLY_WAGE].message || t('WAGE.ERROR'))}
        toolTipContent={t('WAGE.HOURLY_WAGE_TOOLTIP')}
        optional
      />
      {/*TODO: properly fix checkbox label overflow ST-272*/}
      <Checkbox
        data-cy="quickAssign-assignAll"
        style={{ paddingRight: '24px' }}
        label={t('ADD_TASK.ASSIGN_ALL_ON_THIS_DATE_TO_PERSON', { name: selectedWorker.label })}
        onChange={onCheckedAll}
      />
    </ModalComponent>
  );
}
