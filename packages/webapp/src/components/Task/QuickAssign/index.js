import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../../Modals/ModalComponent/v2';
import styles from './styles.module.scss';
import Button from '../../Form/Button';
import ReactSelect from '../../Form/ReactSelect';
import { useSelector, useDispatch } from 'react-redux';
import { userFarmsByFarmSelector } from '../../../containers/userFarmSlice';
import { userFarmSelector } from '../../../containers/userFarmSlice';
import Checkbox from '../../Form/Checkbox';
import { ReactComponent as Person } from '../../../assets/images/task/Person.svg';
import { assignTask, assignTasksOnDate } from '../../../containers/Task/saga';
import { isAdminSelector } from '../../../containers/userFarmSlice';

export default function TaskQuickAssignModal({ dismissModal, taskId, dueDate, isAssigned }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const users = useSelector(userFarmsByFarmSelector);
  const user = useSelector(userFarmSelector);
  const isAdmin = useSelector(isAdminSelector);
  const assigned = true;
  const self = { label: `${user.first_name} ${user.last_name}`, value: user.user_id };

  let workerOptions = isAdmin ? users.map(({ first_name, last_name, user_id }) => ({
    label: `${first_name} ${last_name}`,
    value: user_id,
  })) : [self];

  const assigned_worker = workerOptions[0];

  const unassigned = { label: 'Unassigned', value: null }

  const [worker, setWorker] = useState(assigned ? unassigned : assigned_worker);
  const [assignAll, setAssignAll] = useState(false);

  workerOptions.unshift(unassigned);

  const onAssign = () => {
    console.log(worker);
    console.log(assignAll);
    if (assignAll) {
      console.log(worker.value);
      dispatch(assignTasksOnDate({
        task_id: taskId, 
        date: dueDate,
        assignee_user_id: worker.value,
      }));
    } else {
      dispatch(assignTask({
        task_id: taskId,
        assignee_user_id: worker.value,
      }));
    }
    dismissModal();
  }


  const disabled = worker === null;

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('ADD_TASK.ASSIGN_TASK')}
      buttonGroup={
        <>
          <Button onClick={dismissModal} className={styles.button} color="secondary" sm>
            {t('common:CANCEL')}
          </Button>

          <Button onClick={onAssign} disabled={disabled} className={styles.button} color="primary" sm>
            {t('common:UPDATE')}
          </Button>
        </>
      }
      icon={<Person />}
    >
      <ReactSelect
        defaultValue={ isAssigned ? unassigned : self}
        label={t('ADD_TASK.ASSIGNEE')}
        options={workerOptions}
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
