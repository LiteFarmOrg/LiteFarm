import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import Button from '../../Form/Button';
// TODO: to deprecate
const ConfirmModal = ({ open, onClose, onConfirm, message, option }) => {
  const { t } = useTranslation(['translation', 'common']);
  return open ? (
    <ModalComponent
      contents={[message]}
      dismissModal={onClose}
      buttonGroup={
        <div style={{ display: 'inline-flex', gap: '8px' }}>
          <Button sm color={'secondary'} onClick={onClose}>
            {' '}
            {t('common:CANCEL')}
          </Button>
          <Button sm onClick={onConfirm}>
            {option ? option : t('common:DELETE')}
          </Button>
        </div>
      }
    />
  ) : (
    <></>
  );
  // return <Popup
  //   open={open}
  //   onClose={onClose}
  //   contentStyle={{ width: '100%' }}
  //   overlayStyle={{ zIndex: '1060' }}
  //   closeOnDocumentClick
  // >
  //   <div>
  //     <div>
  //       <h3>{message}</h3>
  //     </div>
  //   </div>
  //   <div className={styles.cancelDelete}>
  //     <div className="btn btn-primary" onClick={() => onClose()}>
  //       {t('common:CANCEL')}
  //     </div>
  //   </div>
  //   <div className={styles.confirmDelete}>
  //     <div className="btn btn-primary" id="confirmDelete" onClick={() => onConfirm()}>
  //       {option ? option : t('common:DELETE')}
  //     </div>
  //   </div>
  // </Popup>
};

export default ConfirmModal;
