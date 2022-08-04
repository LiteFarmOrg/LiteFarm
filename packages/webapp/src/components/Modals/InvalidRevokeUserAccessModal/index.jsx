import React from 'react';
import ModalComponent from '../ModalComponent/v2';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';

export default function InvalidRevokeUserAccessModal({ dismissModal }) {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={t(`PROFILE.PEOPLE.REVOKE_ACCESS`)}
      contents={[t('PROFILE.PEOPLE.DO_YOU_WANT_TO_REMOVE'), t('PROFILE.PEOPLE.THIS_WILL_REMOVE')]}
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
