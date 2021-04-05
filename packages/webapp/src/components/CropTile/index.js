import React from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { ReactComponent as CalendarIcon } from '../../assets/images/fieldCrops/calendar.svg'

export default function PureCropTilePage({ 
  fieldCrop,
  className,
  ...props
}) {
  const { varietalName, type, date } = fieldCrop;
  return (
    <div className={clsx(styles.container, className)} {...props}>
      <div className={styles.img}>{"image"}</div>
      <div className={styles.info}>
        <div className={styles.infoMain} style={{marginBottom: '2px'}}>{varietalName}</div>
        <div className={styles.infoBody} style={{marginBottom: '2px'}}>{type}</div>
        {date && <div className={styles.dateContainer}>
          <CalendarIcon className={styles.plannedIcon} />
          <div className={styles.infoBody}>{date}</div>
        </div>}
      </div>
    </div>
  );
}
