import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import PureSearchbarAndFilter from '../../components/PopupFilter/PureSearchbarAndFilter';
import { Semibold } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { notificationSelector } from '../notificationSlice';
import NotificationCard from './NotificationCard';
import { getNotification } from './saga';
import useStringFilteredNotifications from './useStringFilteredNotifications';

/**
 * Renders a list view of notification cards.
 * @param {} param0
 * @returns {ReactComponent}
 */
export default function NotificationPage({ history }) {
  const { t } = useTranslation();

  // Get the data.
  const cardContents = useSelector(notificationSelector);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getNotification());
  }, []);

  const [filterString, setFilterString] = useState('');
  const filterStringOnChange = (e) => setFilterString(e.target.value);
  const notifications = useStringFilteredNotifications(cardContents, filterString);

  return (
    <Layout classes={{ container: { backgroundColor: 'white', width: '100%', padding: '0px' } }}>
      <PageTitle
        title={t('NOTIFICATION.PAGE_TITLE')}
        style={{ paddingBottom: '20px', marginLeft: '24px', marginTop: '24px' }}
      />

      <div style={{ position: 'relative', marginLeft: '24px', marginRight: '24px' }}>
        <PureSearchbarAndFilter
          // onFilterOpen={onFilterOpen}
          value={filterString}
          onChange={filterStringOnChange}
          isFilterActive={false}
        />
      </div>

      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <NotificationCard
            key={notification.notification_id}
            variables={notification.variables}
            onClick={() => history.push(`/notification/${notification.notification_id}`)}
            translation_key={notification.translation_key}
            {...notification}
          />
        ))
      ) : (
        <Semibold style={{ color: 'var(--teal700)', marginLeft: '24px' }}>
          {t('NOTIFICATION.NONE_TO_DISPLAY')}
        </Semibold>
      )}
    </Layout>
  );
}
