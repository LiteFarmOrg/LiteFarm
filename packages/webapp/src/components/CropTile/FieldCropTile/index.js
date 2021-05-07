import React from 'react';
import styles from '../styles.module.scss';
import clsx from 'clsx';
import { ReactComponent as CalendarIcon } from '../../../assets/images/fieldCrops/calendar.svg';
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

export default function PureFieldCropTile({
  fieldCrop,
  className,
  status,
  history,
  onClick,
  style,
  cropCount,
  children,
}) {
  const { t } = useTranslation();
  const { variety, crop_translation_key, start_date, end_date } = fieldCrop;
  let displayDate;
  const date = new Date(start_date);
  if (isPast(status)) {
    displayDate = date.getFullYear();
  } else if (isPlanned(status)) {
    const parts = date.toDateString().split(' ');
    displayDate = `${parts[1]} ${parts[2]} '${parts[3].slice(-2)}`;
  }

  const imageKey = crop_translation_key.toLowerCase();
  return (
    // <EditFieldCropModal
    //   cropBeingEdited={fieldCrop}
    //   handler={() => {}}
    //   field={fieldCrop?.location}
    //   fieldArea={fieldCrop?.location?.total_area}
    // >
    <PureCropTile
      className={className}
      onClick={onClick}
      style={style}
      src={`crop-images/${imageKey}.jpg`}
      alt={imageKey}
      title={variety}
      isPastVariety={isPast(status)}
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

    // </EditFieldCropModal>
  );
}

PureFieldCropTile.prototype = {
  fieldCrop: PropTypes.shape({
    variety: PropTypes.string,
    start_date: PropTypes.string,
    crop_translation_key: PropTypes.string,
  }),
  className: PropTypes.string,
  status: PropTypes.oneOf(['Past', 'Active', 'Planned']),
  history: PropTypes.object,
  onClick: PropTypes.func,
  style: PropTypes.object,
};
