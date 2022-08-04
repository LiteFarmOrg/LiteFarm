import React from 'react';
import ModalComponent from '../ModalComponent/v2';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';

export default function InvalidRevokeUserAccessModal({ dismissModal }) {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={t(`PROFILE.PEOPLE.INVALID_REVOKE_ACCESS`)}
      contents={[t('PROFILE.PEOPLE.LAST_ADMIN_ERROR')]}
      dismissModal={dismissModal}
      buttonGroup={
        <>
          <Button onClick={dismissModal} color={'secondary'} sm>
            {t('common:NO')}
          </Button>
        </>
      }
      warning
    />
  );
}
