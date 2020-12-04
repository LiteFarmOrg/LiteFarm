import styles from './styles.scss';
import Popup from 'reactjs-popup';
import React from 'react';

const ConfirmModal = ({ open, onClose, onConfirm, message, option }) => {
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
          Cancel
        </div>
      </div>
      <div className={styles.confirmDelete}>
        <div className="btn btn-primary" id="confirmDelete" onClick={() => onConfirm()}>
          {option ? option : 'Delete'}
        </div>
      </div>
    </Popup>
  );
};

export default ConfirmModal;
