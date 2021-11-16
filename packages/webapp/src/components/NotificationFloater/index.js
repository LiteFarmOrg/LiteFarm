import React from 'react';
import { ReactComponent as NotificationTeaserIcon } from '../../assets/images/notification/NotificationTeaser.svg';
import { useTranslation } from 'react-i18next';
import ListOption from '../Navigation/NavBar/ListOption';

import Floater from 'react-floater';

export function PureNotificationFloaterComponent({ notificationTeaser }) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        maxWidth: '148px',
        minWidth: '150px',
        backgroundColor: 'white',
        borderRadius: '4px',
        marginRight: '-4px',
      }}
    >
      <ListOption
        clickFn={notificationTeaser}
        iconText={t('NOTIFICATION.NOTIFICATION_TEASER')}
        icon={<NotificationTeaserIcon />}
      />
    </div>
  );
}

export default function PureNotificationFloater({
  children,
  openProfile,
  notificationTeaserClick,
}) {
  return (
    <Floater
      component={<PureNotificationFloaterComponent notificationTeaser={notificationTeaserClick} />}
      placement={'bottom-end'}
      open={openProfile}
      styles={{
        floater: { zIndex: 1500, display: openProfile ? 'initial' : 'none' },
      }}
    >
      {children}
    </Floater>
  );
}
