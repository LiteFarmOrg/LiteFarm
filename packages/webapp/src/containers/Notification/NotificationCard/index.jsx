import React from 'react';
import PropTypes from 'prop-types';
import { PureNotificationCard } from '../../../components/Card/NotificationCard/NotificationCard';
import { getNotificationCardDate } from '../../../util/moment';

const NotificationCard = ({
  alert,
  status,
  title,
  body,
  variables,
  context,
  created_at,
  onClick,
  classes = { card: {} },
  ...props
}) => {
  return (
    <>
      <PureNotificationCard
        alert={alert}
        status={status}
        title={title}
        body={body}
        variables={variables}
        context={context}
        created_at={getNotificationCardDate(created_at)}
        onClick={onClick}
      />
    </>
  );
};

NotificationCard.propTypes = {
  alert: PropTypes.bool,
  status: PropTypes.oneOf(['Unread', 'Read', 'Archived']),
  translation_key: PropTypes.string,
  variables: PropTypes.array,
  context: PropTypes.object,
  onClick: PropTypes.func,
};

export default NotificationCard;
