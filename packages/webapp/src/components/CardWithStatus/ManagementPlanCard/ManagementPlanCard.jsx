import { CardWithStatus } from '../index';
import styles from './styles.module.scss';
import { ReactComponent as CalendarIcon } from '../../../assets/images/task/Calendar.svg';
import clsx from 'clsx';
import React from 'react';
import { getManagementPlanCardDate } from '../../../util/moment';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const statusColorMap = {
  active: 'secondary',
  planned: 'secondary',
  completed: 'completed',
  abandoned: 'completed',
};

export const managementPlanStatusTranslateKey = {
  active: 'ACTIVE',
  planned: 'PLANNED',
  completed: 'COMPLETED',
  abandoned: 'ABANDONED',
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
  repetition_count,
  repetition_number,
  repeatPlanInfoOnClick,
}) {
  const { t } = useTranslation();

  return (
    <CardWithStatus
      color={statusColorMap[status]}
      style={style}
      status={status}
      label={t(`MANAGEMENT_PLAN.STATUS.${managementPlanStatusTranslateKey[status]}`)}
      classes={{ ...classes, card: { padding: '12px', ...classes.card } }}
      onClick={onClick}
      score={score}
    >
      <div className={styles.info}>
        <div className={clsx(styles.mainTypographySansColor, styles.planName)}>
          {managementPlanName}

          {repetition_count && repetition_number && (
            <span
              className={clsx(styles.repeatPlan, { [styles.underline]: repeatPlanInfoOnClick })}
              onClick={repeatPlanInfoOnClick}
            >
              ({repetition_number}/{repetition_count})
            </span>
          )}
        </div>
        <div className={styles.subMain}>
          {locationName} {notes ? ` | ${notes}` : ''}
        </div>
        <div className={styles.dateUserContainer}>
          {startDate && (
            <>
              <div className={styles.iconTextContainer}>
                <CalendarIcon />
                <div>
                  {getManagementPlanCardDate(startDate)}
                  {endDate && ` - ${getManagementPlanCardDate(endDate)}`}
                </div>
              </div>
              <div className={styles.gap} />
            </>
          )}
          {
            <div className={styles.iconTextContainer}>
              <div className={clsx(styles.circle)}>
                <p>{numberOfPendingTask <= 99 ? numberOfPendingTask : '+99'}</p>
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
  score: PropTypes.oneOf([1, 2, 3, 4, 5, 0, null]),
  managementPlanName: PropTypes.string,
  locationName: PropTypes.string,
  notes: PropTypes.string,
  startDate: PropTypes.any,
  endDate: PropTypes.any,
  numberOfPendingTask: PropTypes.number,
  management_plan_id: PropTypes.number,
  management_plan_group_id: PropTypes.string,
  repetition_count: PropTypes.number,
  repetition_number: PropTypes.number,
  repeatPlanInfoOnClick: PropTypes.func,
};
