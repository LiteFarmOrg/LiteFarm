import React from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { ReactComponent as CalendarIcon } from '../../../assets/images/managementPlans/calendar.svg';
import PropTypes from 'prop-types';
import { ImageWithAuthentication } from '../../ImageWithAuthentication';
import { useTranslation } from 'react-i18next';
import { DocumentIcon } from '../../../components/Icons/DocumentIcon';

export default function PureDocumentTile({
  className,
  title,
  type,
  date,
  preview,
  onClick,
  noExpiration,
  extensionName,
  imageComponent = (props) => <ImageWithAuthentication {...props} />,
}) {
  const { t } = useTranslation();

  return (
    <div className={clsx(styles.container, className)} onClick={onClick}>
      {preview ? (
        imageComponent({
          className: styles.img,
          src: preview,
        })
      ) : (
        <div className={styles.documentIconContainer}>
          <DocumentIcon extensionName={extensionName} />
        </div>
      )}
      <div className={styles.info}>
        <div className={styles.title} style={{ marginBottom: '4px' }}>
          {title}
        </div>
        {type && (
          <>
            <div
              className={styles.type}
              style={{
                marginTop: '4px',
                marginBottom: date ? '4px' : '8px',
              }}
            >
              {t(`DOCUMENTS.TYPE.${type}`)}
            </div>
          </>
        )}
        {date && !noExpiration && (
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
  extensionName: PropTypes.string,
};
