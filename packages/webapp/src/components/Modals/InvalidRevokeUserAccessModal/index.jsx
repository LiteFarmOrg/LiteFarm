import React from 'react';
import ModalComponent from '../ModalComponent/v2';
import { Trans, useTranslation } from 'react-i18next';
import styles from '../../../../src/components/Typography/typography.module.scss';

export default function InvalidRevokeUserAccessModal({ dismissModal }) {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={t(`PROFILE.PEOPLE.INVALID_REVOKE_ACCESS`)}
      dismissModal={dismissModal}
      warning
    >
      <div className={styles.info}>
        <Trans i18nKey="PROFILE.PEOPLE.LAST_ADMIN_ERROR">
          text <a href="/help">link</a> text
        </Trans>
      </div>
    </ModalComponent>
  );
}
