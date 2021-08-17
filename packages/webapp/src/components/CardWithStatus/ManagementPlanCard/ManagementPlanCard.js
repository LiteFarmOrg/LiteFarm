import { CardWithStatus } from '../index';
import styles from './styles.module.scss';
import { ReactComponent as CalendarIcon } from '../../../assets/images/task/Calendar.svg';
import clsx from 'clsx';
import React from 'react';
import { getShortLocalizedDateString } from '../../../util/moment';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const statusColorMap = {
  active: 'secondary',
  planned: 'secondary',
  completed: 'completed',
  abandoned: 'completed',
};

export function ManagementPlanCard({
  managementPlanName,
  locationName,
  notes,
  startDate,
  endDate,
  numberOfPendingTask,
  style,
  status,
  classes = { card: {} },
  onClick,
  score,
}) {
  const { t } = useTranslation();
  const statusText = {
    active: t('MANAGEMENT_PLAN.STATUS.ACTIVE'),
    planned: t('MANAGEMENT_PLAN.STATUS.PLANNED'),
    completed: t('MANAGEMENT_PLAN.STATUS.COMPLETED'),
    abandoned: t('MANAGEMENT_PLAN.STATUS.ABANDONED'),
  };
  return (
    <CardWithStatus
      color={statusColorMap[status]}
      style={style}
      status={status}
      label={statusText[status]}
      classes={{ ...classes, card: { padding: '12px', ...classes.card } }}
      onClick={onClick}
      score={score}
    >
      <div className={styles.info}>
        <div className={styles.mainTypographySansColor}>{managementPlanName}</div>
        <div className={styles.subMain}>
          {locationName} {notes ? ` | ${notes}` : ''}
        </div>
        <div className={styles.dateUserContainer}>
          <div className={styles.iconTextContainer}>
            <CalendarIcon />
            <div>{`${getShortLocalizedDateString(startDate)} - ${getShortLocalizedDateString(
              endDate,
            )}`}</div>
          </div>
          <div className={styles.gap} />
          {
            <div className={styles.iconTextContainer}>
              <div className={clsx(styles.circle)}>
                <p style={{ transform: 'translateX(-0.6px)' }}>
                  {numberOfPendingTask <= 99 ? numberOfPendingTask : '+99'}
                </p>
              </div>
              <div>{t('MANAGEMENT_PLAN.PENDING_TASK')}</div>
            </div>
          }
        </div>
      </div>
    </CardWithStatus>
  );
}

ManagementPlanCard.propTypes = {
  style: PropTypes.object,
  status: PropTypes.oneOf(['active', 'planned', 'completed', 'abandoned']),
  classes: PropTypes.shape({ container: PropTypes.object, card: PropTypes.object }),
  onClick: PropTypes.func,
  score: PropTypes.oneOf([1, 2, 3, 4, 5, 0]),
  managementPlanName: PropTypes.string,
  locationName: PropTypes.string,
  notes: PropTypes.string,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  numberOfPendingTask: PropTypes.number,
};
