import React from 'react';
import { ReactComponent as NotificationTeaserIcon } from '../../assets/images/notification/NotificationTeaser.svg';
import { useTranslation } from 'react-i18next';

import Floater from 'react-floater';

export function PureNotificationFloaterComponent({ notificationTeaser }) {
  const { t } = useTranslation();
  return (
    <div
      onClick={notificationTeaser}
      style={{
        maxWidth: '148px',
        minWidth: '150px',
        backgroundColor: 'white',
        borderRadius: '4px',
        marginRight: '-4px',
        paddingLeft: '0.8rem',
        paddingTop: '0.4rem',
        paddingBottom: '0.4rem',
      }}
    >
      <NotificationTeaserIcon />
      {t('NOTIFICATION.NOTIFICATION_TEASER')}
    </div>
  );
}

export default function PureNotificationFloater({ children, openProfile, closeInteraction }) {
  const notificationTeaserClick = () => {
    closeInteraction('notification');
  };
  const Wrapper = <PureNotificationFloaterComponent notificationTeaser={notificationTeaserClick} />;
  return (
    <Floater component={Wrapper} placement={'bottom-end'} open={openProfile}>
      {children}
    </Floater>
  );
}
