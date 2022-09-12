import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import styles from './styles.module.scss';
import Button from '../../Form/Button';
import ReactSelect from '../../Form/ReactSelect';
import Checkbox from '../../Form/Checkbox';
import { ReactComponent as Person } from '../../../assets/images/task/Person.svg';
import { tasksSelector } from '../../../containers/taskSlice';
import { useSelector } from 'react-redux';
import { Label } from '../../Typography';
import Input from '../../Form/Input';

export default function TaskQuickAssignModal({
  dismissModal,
  task_id,
  due_date,
  isAssigned,
  onAssignTasksOnDate,
  onAssignTask,
  onUserUpdated,
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
  const [wage, setWage] = useState('');
  const [wageError, setWageError] = useState();
  const [dontAsk, setDontAsk] = useState(false);
  const [assignAll, setAssignAll] = useState(false);

  const selectedWorkerData = useMemo(() => {
    return users.find(({ user_id }) => user_id === selectedWorker.value);
  }, [selectedWorker]);

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
    if (!!wageError) {
      return;
    }

    if (assignAll && checkUnassignedTaskForSameDate() && selectedWorker.value !== null) {
      onAssignTasksOnDate({
        task_id: task_id,
        date: due_date,
        assignee_user_id: selectedWorker.value,
      });
    } else {
      onAssignTask({
        task_id: task_id,
        assignee_user_id: selectedWorker.value,
      });
    }

    if ((wage || dontAsk) && onUserUpdated) {
      const wagePayload = {
        ...selectedWorkerData.wage,
        dont_ask_again: dontAsk,
      };

      if (typeof wage === 'number') {
        wagePayload.amount = wage;
      }

      onUserUpdated({
        ...selectedWorkerData,
        wage: wagePayload,
      });
    }
    dismissModal();
  };

  const handleWageChange = (e) => {
    const wage = Number(e.target.value);
    setWage(wage);
    if (wage < 0 || wage > 999999999) {
      setWageError(t('ADD_TASK.WAGE_ERROR'));
    } else {
      setWageError();
    }
  };

  const onCheckedAll = () => {
    setAssignAll(!assignAll);
  };

  const disabled = selectedWorker === null;
  const showWageFields =
    selectedWorkerData?.wage?.amount === 0 && !selectedWorkerData?.wage?.dont_ask_again;

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
        style={{ marginBottom: '24px' }}
        isSearchable
      />
      {showWageFields ? (
        <>
          <Label className={styles.warning}>
            {selectedWorkerData.first_name} {t('ADD_TASK.UNASSIGNED_WAGE_WARNING')}
          </Label>
          <Input
            data-cy="quickAssign-wageInput"
            label={t('ADD_TASK.WAGE_INPUT')}
            type="number"
            value={wage}
            onChange={handleWageChange}
            errors={wageError}
            optional
          />
          <Checkbox
            className={styles.input}
            value={dontAsk}
            data-cy="quickAssign-dontAsk"
            label={t('ADD_TASK.DONT_ASK')}
            onChange={() => setDontAsk(!dontAsk)}
          />
          <Checkbox
            className={styles.input}
            value={assignAll}
            data-cy="quickAssign-updateAll"
            label={t('ADD_TASK.UPDATE_ALL')}
            onChange={onCheckedAll}
          />
        </>
      ) : (
        <>
          {/*TODO: properly fix checkbox label overflow ST-272*/}
          <Checkbox
            data-cy="quickAssign-assignAll"
            style={{ paddingRight: '24px' }}
            label={t('ADD_TASK.ASSIGN_ALL_TO_PERSON')}
            onChange={onCheckedAll}
          />
        </>
      )}
    </ModalComponent>
  );
}
