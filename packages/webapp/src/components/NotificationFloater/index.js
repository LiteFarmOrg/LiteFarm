import React from 'react';
import { ReactComponent as NotificationTeaserIcon } from '../../assets/images/notification/NotificationTeaser.svg';
import { useTranslation } from 'react-i18next';
import ListOption from '../Navigation/NavBar/ListOption/index';

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
        customParagraphStyle={{ paddingTop: '0.5rem' }}
      />
    </div>
  );
}

export default function PureNotificationFloater({ children, openProfile, notificationTeaserClick }) {
  
  return (
    <Floater component={<PureNotificationFloaterComponent notificationTeaser={notificationTeaserClick}/>} placement={'bottom-end'} open={openProfile}>
      {children}
    </Floater>
  );
}
