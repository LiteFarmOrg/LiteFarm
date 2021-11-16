import styles from './styles.module.scss';
import closeButton from '../../../assets/images/grey_close_button.png';
import Button from '../../Form/Button';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MuiFullPagePopup from '../../MuiFullPagePopup';

function PureAddTaskModal({ showModal, switchShowModal, addTaskType, showTaskRequiredError }) {
  const { t } = useTranslation(['translation', 'common']);
  const [taskName, setTaskName] = useState('');

  const addCustomTask = () => {
    if (taskName !== '') {
      addTaskType(taskName);
      switchShowModal(false);
    } else showTaskRequiredError();
  };

  const customTaskName = (event) => {
    const value = event.target.value;
    setTaskName(value);
  };
  return (
    <MuiFullPagePopup open={showModal} onClose={() => switchShowModal(false)}>
      <div className={styles.modal}>
        <div className={styles.popupTitle}>
          <a className={styles.close} onClick={() => switchShowModal(false)}>
            <img src={closeButton} alt="" />
          </a>
          <h3>{t('SHIFT.EDIT_SHIFT.ADD_TASK')}</h3>
        </div>
        <div className={styles.customContainer}>
          <div className={styles.taskTitle}>{t('SHIFT.EDIT_SHIFT.NAME_TASK')}</div>
          <div className={styles.taskInput}>
            <input type="text" maxLength="20" onChange={customTaskName} />
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <Button onClick={addCustomTask}>{t('common:FINISH')}</Button>
        </div>
      </div>
    </MuiFullPagePopup>
  );
}

export default PureAddTaskModal;
