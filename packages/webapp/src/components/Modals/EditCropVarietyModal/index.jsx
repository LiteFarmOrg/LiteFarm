import React from 'react';
import ModalComponent from '../ModalComponent/v2';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import styles from './styles.module.scss';

export default function EditCropVarietyModal({ dismissModal, handleEdit }) {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={t('CROP.EDIT_MODAL.TITLE')}
      contents={[t('CROP.EDIT_MODAL.BODY')]}
      dismissModal={dismissModal}
      buttonGroup={
        <>
          <Button className={styles.button} onClick={dismissModal} color={'secondary'} sm>
            {t('common:CANCEL')}
          </Button>
          <Button className={styles.button} onClick={handleEdit} sm>
            {t('common:EDIT')}
          </Button>
        </>
      }
    />
  );
}
