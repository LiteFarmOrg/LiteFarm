import React from 'react';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import { ReactComponent as CalendarIcon } from '../../../assets/images/managementPlans/calendar.svg';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import PureCropTile from '../index';

const cropStatus = {
  active: 'Active',
  past: 'Past',
  planned: 'Planned',
};

const isActive = (status) => status === cropStatus.active;
const isPast = (status) => status === cropStatus.past;
const isPlanned = (status) => status === cropStatus.planned;

export default function PureManagementPlanTile({
  managementPlan,
  className,
  status,
  history,
  onClick,
  style,
  cropCount,
  children,
  isSelected,
}) {
  const { t } = useTranslation();
  const {
    crop_variety_name,
    crop_translation_key,
    seed_date,
    harvest_date,
    crop_variety_photo_url,
  } = managementPlan;
  let displayDate;
  const date = new Date(seed_date);
  if (isPast(status)) {
    displayDate = date.getFullYear();
  } else if (isPlanned(status)) {
    const parts = date.toDateString().split(' ');
    displayDate = `${parts[1]} ${parts[2]} '${parts[3].slice(-2)}`;
  }

  const imageKey = crop_translation_key.toLowerCase();
  return (
    <PureCropTile
      className={className}
      onClick={onClick}
      style={style}
      src={crop_variety_photo_url}
      alt={imageKey}
      title={crop_variety_name}
      isPastVariety={isPast(status)}
      isSelected={isSelected}
    >
      <>
        <div className={styles.infoBody} style={{ margin: '2px 0' }}>
          <div style={{ fontSize: '12px' }}>{t(`crop:${crop_translation_key}`)}</div>
        </div>
        <div style={{ flexGrow: '1' }} />
        {displayDate && (
          <div className={styles.dateContainer}>
            <CalendarIcon
              className={clsx(
                styles.icon,
                isPast(status) && styles.pastIcon,
                isPlanned(status) && styles.plannedIcon,
              )}
            />
            <div className={styles.infoBody}>{displayDate}</div>
          </div>
        )}
      </>
    </PureCropTile>
  );
}

PureManagementPlanTile.prototype = {
  managementPlan: PropTypes.shape({
    crop_variety_name: PropTypes.string,
    seed_date: PropTypes.string,
    crop_translation_key: PropTypes.string,
  }),
  className: PropTypes.string,
  status: PropTypes.oneOf(['Past', 'Active', 'Planned']),
  history: PropTypes.object,
  onClick: PropTypes.func,
  style: PropTypes.object,
};
