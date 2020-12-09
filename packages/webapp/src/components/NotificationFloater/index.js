import React from 'react';
import NotificationTeaserIcon from '../../assets/images/notification/NotificationTeaser.svg';
import ListOption from '../Navigation/NavBar/ListOption';
import { useTranslation } from 'react-i18next';

import Floater from 'react-floater';

export function PureNotificationFloaterComponent({ notificationTeaser }) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        maxWidth: '148px',
        minWidth: '138px',
        backgroundColor: 'white',
        borderRadius: '4px',
        marginRight: '-4px',
      }}
    >
      <ListOption
        clickFn={notificationTeaser}
        iconText={t('NOTIFICATION.NOTIFICATION_TEASER')}
        iconSrc={NotificationTeaserIcon}
        customParagraphStyle={{ paddingTop: '0.5rem' }}
      />
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
