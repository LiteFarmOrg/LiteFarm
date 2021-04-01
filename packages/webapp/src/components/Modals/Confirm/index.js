import styles from './styles.module.scss';
import Popup from 'reactjs-popup';
import React from 'react';
import { useTranslation } from 'react-i18next';
// TODO: to deprecate
const ConfirmModal = ({ open, onClose, onConfirm, message, option }) => {
  const { t } = useTranslation(['translation', 'common']);
  return (
    <Popup
      open={open}
      onClose={onClose}
      contentStyle={{ width: '100%' }}
      overlayStyle={{ zIndex: '1060' }}
      closeOnDocumentClick
    >
      <div>
        <div>
          <h3>{message}</h3>
        </div>
      </div>
      <div className={styles.cancelDelete}>
        <div className="btn btn-primary" onClick={() => onClose()}>
          {t('common:CANCEL')}
        </div>
      </div>
      <div className={styles.confirmDelete}>
        <div className="btn btn-primary" id="confirmDelete" onClick={() => onConfirm()}>
          {option ? option : t('common:DELETE')}
        </div>
      </div>
    </Popup>
  );
};

export default ConfirmModal;
