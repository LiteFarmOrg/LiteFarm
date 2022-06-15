import React from 'react';
import { Text } from '../../Typography';
import PureWarningBox from '../../WarningBox';
import history from '../../../history';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';

function MoreRecentNotificationWarning({ notificationId, entityType }) {
  const { t } = useTranslation();
  const translatedEntityType = t(`ENTITY_TYPES.${entityType.toUpperCase()}`);
  return (
    <PureWarningBox className={styles.warningBox} iconClassName={styles.warningIcon}>
      <Text>
        {t('NOTIFICATION.TIMELINE.MORE_RECENT_NOTIFICATION', { entityType: translatedEntityType })}
      </Text>
      <a
        className={styles.viewNowLink}
        onClick={() => history.push(`/notifications/${notificationId}/read_only`)}
      >
        {t('NOTIFICATION.TIMELINE.VIEW_NOW')}
      </a>
    </PureWarningBox>
  );
}

export default MoreRecentNotificationWarning;
