import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import styles from './styles.module.scss';
import Button from '../../Form/Button';
import ReactSelect from '../../Form/ReactSelect';
import Checkbox from '../../Form/Checkbox';
import { ReactComponent as Person } from '../../../assets/images/task/Person.svg';

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
  const unAssignedOption = { label: t('TASK.UNASSIGNED'), value: null };
  const options = useMemo(() => {
    if (user.is_admin) {
      const options = users.map(({ first_name, last_name, user_id }) => ({
        label: `${first_name} ${last_name}`,
        value: user_id,
      }));
      options.unshift(unAssignedOption);
      return options;
    } else return [selfOption, unAssignedOption];
  }, []);

  const [selectedWorker, setWorker] = useState(isAssigned ? unAssignedOption : selfOption);
  const [assignAll, setAssignAll] = useState(false);

  const onAssign = () => {
    assignAll
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

  const disabled = selectedWorker === null;

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
        defaultValue={selectedWorker}
        label={t('ADD_TASK.ASSIGNEE')}
        options={options}
        onChange={setWorker}
        style={{ marginBottom: '24px' }}
        isSearchable
      />
      <Checkbox
        label={t('ADD_TASK.ASSIGN_ALL_TO_PERSON')}
        onChange={() => setAssignAll(!assignAll)}
      />
    </ModalComponent>
  );
}
