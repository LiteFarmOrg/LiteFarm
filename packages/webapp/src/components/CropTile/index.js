import React from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { ReactComponent as CalendarIcon } from '../../assets/images/fieldCrops/calendar.svg';
import { useTranslation } from 'react-i18next';
import EditFieldCropModal from '../Forms/EditFieldCropModal/EditFieldCropModal';

const cropStatus = {
  active: 'Active',
  past: 'Past',
  planned: 'Planned',
};

const isActive = (status) => status === cropStatus.active;
const isPast = (status) => status === cropStatus.past;
const isPlanned = (status) => status === cropStatus.planned;

export default function PureCropTile({ fieldCrop, className, status, history, onClick }) {
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
  return (
    <EditFieldCropModal
      cropBeingEdited={fieldCrop}
      handler={() => {}}
      field={fieldCrop.location}
      fieldArea={fieldCrop.location.total_area}
    >
      <div className={clsx(styles.container, isPast(status) && styles.pastContainer, className)}>
        <div className={styles.img}></div>
        <div className={styles.info}>
          <div className={styles.infoMain} style={{ marginBottom: '2px' }}>
            {variety}
          </div>
          <div className={styles.infoBody} style={{ marginBottom: '2px' }}>
            {t(`crop:${crop_translation_key}`)}
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
        </div>
      </div>
    </EditFieldCropModal>
  );
}
