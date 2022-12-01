import React from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { ReactComponent as CalendarIcon } from '../../../assets/images/managementPlans/calendar.svg';
import PropTypes from 'prop-types';
import { MediaWithAuthentication } from '../../../containers/MediaWithAuthentication';
import { mediaEnum } from '../../../containers/MediaWithAuthentication/constants';
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
  fileUrl,
  imageComponent = (props) => <MediaWithAuthentication {...props} />,
  fileDownloadComponent = (props) => <MediaWithAuthentication {...props} />,
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.previewWrapper}>
      <div className={clsx(styles.container, className)} onClick={onClick}>
        {preview ? (
          imageComponent({
            className: styles.img,
            fileUrl: preview,
            mediaType: mediaEnum.IMAGE,
          })
        ) : (
          <div className={styles.documentIconContainer}>
            <DocumentIcon extensionName={extensionName} />
          </div>
        )}
        <div className={styles.info}>
          <div>
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
          </div>
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
      {fileUrl &&
        fileDownloadComponent({
          className: styles.downloadContainer,
          fileUrl,
          title: `${title}.${extensionName}`,
          mediaType: mediaEnum.DOCUMENT,
        })}
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
  fileUrl: PropTypes.string,
};
