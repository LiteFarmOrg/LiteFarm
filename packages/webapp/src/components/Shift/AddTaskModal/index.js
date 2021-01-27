import Popup from "reactjs-popup";
import styles from "./styles.scss";
import closeButton from "../../../assets/images/grey_close_button.png";
import Button from "../../Form/Button";
import React from "react";
import { useTranslation } from "react-i18next";

function PureAddTaskModal({showModal, switchShowModal, customTaskName, addCustomTask}) {
  const { t } = useTranslation();
  return (
    <Popup
      open={showModal}
      closeOnDocumentClick
      onClose={() => switchShowModal(false)}
      contentStyle={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        padding: '0 5%',
      }}
      overlayStyle={{ zIndex: '1060', height: '100vh' }}
    >
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
    </Popup>
  );

}

export default PureAddTaskModal;