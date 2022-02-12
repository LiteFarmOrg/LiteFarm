import React from 'react';
import ModalComponent from '../ModalComponent/v2';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import styles from './styles.module.scss';

export default function RevokeUserAccessModal({ dismissModal, onRevoke }) {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={t(`PROFILE.PEOPLE.REVOKE_ACCESS`)}
      contents={[t('PROFILE.PEOPLE.DO_YOU_WANT_TO_REMOVE'), t('PROFILE.PEOPLE.THIS_WILL_REMOVE')]}
      dismissModal={dismissModal}
      buttonGroup={
        <>
          <Button className={styles.button} onClick={dismissModal} color={'secondary'} sm>
            {t('common:NO')}
          </Button>
          <Button className={styles.button} onClick={onRevoke} sm>
            {t('common:YES')}
          </Button>
        </>
      }
      warning
    />
  );
}
