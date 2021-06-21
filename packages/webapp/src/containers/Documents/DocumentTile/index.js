import React from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { ReactComponent as CalendarIcon } from '../../../assets/images/managementPlans/calendar.svg';
import PropTypes from 'prop-types';
import { ImageWithAuthentication } from '../../ImageWithAuthentication';

export default function PureDocumentTile({
  className,
  title,
  type,
  date,
  preview,
  onClick,
  imageComponent = (props) => <ImageWithAuthentication {...props} />,
}) {
  return (
    <div className={clsx(styles.container, className)} onClick={onClick}>
      {imageComponent({
        className: styles.img,
        src: preview,
      })}
      <div className={styles.info}>
        <div className={styles.title}>{title}</div>
        <div
          className={styles.type}
          style={{
            marginTop: '4px',
            marginBottom: date ? '4px' : '8px',
          }}
        >
          {type}
        </div>
        {date && (
          <>
            <div className={styles.date} style={{ marginBottom: '8px' }}>
              {<CalendarIcon className={styles.calendar} />}
              {date}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

PureDocumentTile.prototype = {
  className: PropTypes.string,
  title: PropTypes.string,
  type: PropTypes.string,
  date: PropTypes.string,
  preview: PropTypes.string,
  onClick: PropTypes.func,
};
