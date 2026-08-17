import React from 'react';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import CalendarIcon from '../../../assets/images/managementPlans/calendar.svg?react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import PureCropTile from '../index';
import { getManagementPlanTileDate } from '../../../util/moment';

const cropStatus = {
  active: 'active',
  planned: 'planned',
  completed: 'completed',
  abandoned: 'abandoned',
};

const isActive = (status) => status === cropStatus.active;
const isPast = (status) => status === cropStatus.completed || status === cropStatus.abandoned;
const isPlanned = (status) => status === cropStatus.planned;

export default function PureManagementPlanTile({
  managementPlan,
  className,
  status,
  onClick,
  style,
  isSelected,
  date,
}) {
  const { t } = useTranslation();
  const { crop_variety_name, crop_translation_key, crop_variety_photo_url, start_date } =
    managementPlan;
  const displayDate = date || start_date;

  const notes =
    managementPlan?.planting_management_plan?.bed_method?.specify_beds ||
    managementPlan?.planting_management_plan?.row_method?.specify_rows;

  const imageKey = crop_translation_key.toLowerCase();
  return (
    <PureCropTile
      className={className}
      onClick={onClick}
      style={style}
      src={crop_variety_photo_url}
      alt={imageKey}
      title={crop_variety_name}
      ispastVariety={isPast(status)}
      isSelected={isSelected}
      status={status}
    >
      <>
        <div className={styles.infoBody} style={{ margin: '2px 0' }}>
          <div style={{ fontSize: '12px' }}>{t(`crop:${crop_translation_key}`)}</div>
        </div>
        <div style={{ flexGrow: '1' }} />
        {notes && <div className={styles.note}>{notes}</div>}
        {displayDate && (
          <div className={styles.dateContainer}>
            <CalendarIcon className={clsx(styles.icon, isPast(status) && styles.pastIcon)} />
            <div className={styles.infoBody}>{getManagementPlanTileDate(displayDate)}</div>
          </div>
        )}
      </>
    </PureCropTile>
  );
}

PureManagementPlanTile.prototype = {
  managementPlan: PropTypes.shape({
    crop_variety_name: PropTypes.string,
    start_date: PropTypes.string,
    crop_translation_key: PropTypes.string,
  }),
  className: PropTypes.string,
  status: PropTypes.oneOf(['active', 'planned', 'completed', 'abandoned']),
  onClick: PropTypes.func,
  style: PropTypes.object,
  isSelected: PropTypes.bool,
  date: PropTypes.string,
};
