/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { ReactComponent as AwardIcon } from '../../assets/images/nav/certifications.svg';
import { ReactComponent as EditIcon } from '../../assets/images/edit.svg';
import { ReactComponent as TrashIcon } from '../../assets/images/farm-profile/trash.svg';
import { ReactComponent as DocumentIcon } from '../../assets/images/document.svg';
import { getLocalizedDateString } from '../../util/moment';
import type { CertificationStatus, SystemType } from './types';
import styles from './index.module.scss';

interface CertificationCardProps {
  certificationSystemType: string;
  systemType: SystemType;
  certifierName: string;
  certificationIdentifier?: string | null;
  status: CertificationStatus;
  expiryDate?: string | null;
  documentFileName?: string | null;
  onEdit: () => void;
  onDelete: () => void;
}

const STATUS_KEYS: Record<Exclude<CertificationStatus, 'pursuing'>, string> = {
  active: 'CERTIFICATION.STATUS.ACTIVE',
  expiring_soon: 'CERTIFICATION.STATUS.EXPIRING_SOON',
  expired: 'CERTIFICATION.STATUS.EXPIRED',
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getDaysLeft(isoDate: string): number {
  return Math.ceil((new Date(isoDate).getTime() - Date.now()) / MS_PER_DAY);
}

export default function CertificationCard({
  certificationSystemType,
  systemType,
  certifierName,
  certificationIdentifier,
  status,
  expiryDate,
  documentFileName,
  onEdit,
  onDelete,
}: CertificationCardProps) {
  const { t } = useTranslation(['translation', 'common']);
  const isPursuing = status === 'pursuing';

  const title = isPursuing
    ? t('CERTIFICATION.CARD.PURSUING_TITLE', { name: certificationSystemType })
    : certificationSystemType;

  const subtitleParts = [certifierName];
  if (!isPursuing && expiryDate) {
    const date = getLocalizedDateString(expiryDate, { month: '2-digit', year: 'numeric' });
    // The localized date can contain '/', which i18next would HTML-escape by default
    const options = { date, interpolation: { escapeValue: false } };
    subtitleParts.push(
      status === 'expired'
        ? t('CERTIFICATION.CARD.EXPIRED_ON', options)
        : t('CERTIFICATION.CARD.EXPIRES', options),
    );
    if (status === 'expiring_soon') {
      const daysLeft = getDaysLeft(expiryDate);
      if (daysLeft > 0) {
        subtitleParts.push(t('CERTIFICATION.CARD.DAYS_LEFT', { count: daysLeft }));
      }
    }
  }

  const identifierLabel =
    systemType === 'pgs'
      ? t('CERTIFICATION.CARD.MEMBER_ID')
      : t('CERTIFICATION.CARD.CERTIFICATION_ID');

  const hasDetails = !isPursuing && !!(certificationIdentifier || documentFileName);

  return (
    <div className={clsx(styles.card, styles[status])}>
      <div className={clsx(styles.cardMain, !hasDetails && styles.cardMainOnly)}>
        <div className={styles.cardBody}>
          <AwardIcon className={styles.cardAwardIcon} aria-hidden />
          <div className={styles.cardTitles}>
            <span className={styles.cardTitle}>{title}</span>
            <span className={styles.cardSubtitle}>{subtitleParts.join(' · ')}</span>
          </div>
        </div>

        <div className={styles.cardMeta}>
          {!isPursuing && (
            <span className={clsx(styles.cardStatusBadge, styles[status])}>
              {t(STATUS_KEYS[status])}
            </span>
          )}
          <div className={styles.cardActions}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={onEdit}
              aria-label={t('common:EDIT')}
            >
              <EditIcon />
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={onDelete}
              aria-label={t('common:DELETE')}
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>

      {hasDetails && (
        <div className={styles.cardDetails}>
          {certificationIdentifier && (
            <div className={styles.cardDetail}>
              <span className={styles.cardDetailLabel}>{identifierLabel}</span>
              <span className={styles.cardDetailValue}>{certificationIdentifier}</span>
            </div>
          )}
          {documentFileName && (
            <div className={clsx(styles.cardDetail, styles.cardDocument)}>
              <span className={styles.cardDetailLabel}>
                {t('CERTIFICATION.CARD.CERTIFICATE_DOCUMENT')}
              </span>
              <span className={clsx(styles.cardDetailValue, styles.cardDocumentName)}>
                <DocumentIcon aria-hidden />
                {documentFileName}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
