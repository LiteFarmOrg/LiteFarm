import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../../Modals/ModalComponent/v2';
import styles from './styles.module.scss';
import Button from '../../Form/Button';
import ReactSelect from '../../Form/ReactSelect';
import { useSelector } from 'react-redux';
import { userFarmsByFarmSelector } from '../../../containers/userFarmSlice';
import { userFarmSelector } from '../../../containers/userFarmSlice';
import Checkbox from '../../Form/Checkbox';
import { ReactComponent as Person } from '../../../assets/images/task/Person.svg';

export default function TaskQuickAssignModal({ dismissModal }) {
  const { t } = useTranslation();
  const users = useSelector(userFarmsByFarmSelector);
  const user = useSelector(userFarmSelector);
  const isAdmin =false; //user.is_admin;
  const [worker, setWorker] = useState(null);
  const [assignAll, setAssignAll] = useState(false);

  let workerOptions = isAdmin? users.map(({ first_name, last_name, user_id }) => ({
    label: `${first_name} ${last_name}`,
    value: user_id,
  })) : [{label: `${user.first_name} ${user.last_name}`, value: user.user_id}];

  workerOptions.unshift({label: 'Unassigned', value: null});

  const onAssign = () => {
    console.log(worker);
    console.log(assignAll);
  }

  const disabled = worker === null;

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('TASK.ASSIGN_TASK')}
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
        label={t('TASK.ASSIGNEE')}
        options={workerOptions}
        onChange={setWorker}
        value={worker}
        style={{ marginBottom: '24px' }}
        isSearchable
      />
      <Checkbox
        label={t('TASK.ASSIGN_ALL_TO_PERSON')}
        onChange={() => setAssignAll(!assignAll)}
      />
    </ModalComponent>
  );
}
