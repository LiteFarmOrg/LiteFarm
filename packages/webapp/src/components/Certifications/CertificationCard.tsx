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
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { ReactComponent as AwardIcon } from '../../assets/images/nav/certifications.svg';
import { ReactComponent as EditIcon } from '../../assets/images/edit.svg';
import { ReactComponent as TrashIcon } from '../../assets/images/farm-profile/trash.svg';
import { ReactComponent as DocumentIcon } from '../../assets/images/document.svg';
import { getLocalizedDateString } from '../../util/moment';
import type { CertificationStatus } from './types';
import {
  getDaysLeft,
  getCertificationStatus,
  PGS_TRANSLATION_KEY,
  ACTIVE,
  EXPIRING_SOON,
  PURSUING,
  EXPIRED,
} from '../../containers/Certifications/utils';
import styles from './index.module.scss';

interface CertificationCardProps {
  systemTypeTranslationKey: string;
  requestedSystemType?: string;
  certifierName: string;
  certifierAcronym?: string;
  certificateNumber?: string | null;
  certificateMemberId?: string | null;
  isActive: boolean;
  expiryDate?: string | null;
  documentFileName?: string | null;
  onEdit: () => void;
  onDelete?: () => void;
}

const getSubtitle = (
  t: TFunction,
  status: CertificationStatus,
  certifierName: string,
  certifierAcronym?: string,
  requestedSystemType?: string,
  expiryDate?: string | null,
) => {
  if (status === PURSUING) {
    if (certifierAcronym) {
      return `${certifierAcronym} — ${certifierName}`;
    }
    return [certifierName, requestedSystemType].filter(Boolean).join('/');
  }
  if (expiryDate) {
    const subtitleParts = [certifierAcronym || certifierName];
    const date = getLocalizedDateString(expiryDate, { month: '2-digit', year: 'numeric' });
    // The localized date can contain '/', which i18next would HTML-escape by default
    const options = { date, interpolation: { escapeValue: false } };
    subtitleParts.push(t(status === EXPIRED ? 'common:EXPIRED_ON' : 'common:EXPIRES', options));
    if (status === EXPIRING_SOON) {
      subtitleParts.push(t('common:DAYS_LEFT', { count: getDaysLeft(expiryDate) }));
    }
    if (status !== EXPIRED) {
      return subtitleParts.filter(Boolean).join(' · ');
    }
    return (
      <>
        <span>{subtitleParts.filter(Boolean).join(' · ')}</span>
        <span className={styles.connector}> - </span>
        <span>{t('CERTIFICATION.WILL_STILL_APPEAR_IN_MARKET_LISTING')}</span>
      </>
    );
  }
};

export default function CertificationCard({
  systemTypeTranslationKey,
  requestedSystemType,
  certifierName,
  certifierAcronym,
  certificateNumber,
  certificateMemberId,
  isActive,
  expiryDate,
  documentFileName,
  onEdit,
  onDelete,
}: CertificationCardProps) {
  const { t } = useTranslation(['translation', 'common', 'certifications']);
  const status = getCertificationStatus(isActive, expiryDate);
  const isPursuing = status === PURSUING;

  // t('certifications:THIRD_PARTY_ORGANIC')
  // t('certifications:PGS')
  const systemTypeName = t(`certifications:${systemTypeTranslationKey}`);
  const title = isPursuing
    ? t('CERTIFICATION.PURSUING_ITEM', { item: systemTypeName })
    : systemTypeName;

  const subtitle = getSubtitle(
    t,
    status,
    certifierName,
    certifierAcronym,
    requestedSystemType,
    expiryDate,
  );

  const isPgs = systemTypeTranslationKey === PGS_TRANSLATION_KEY;
  const identifierLabel = isPgs
    ? t('CERTIFICATION.MEMBER_ID')
    : t('CERTIFICATION.CERTIFICATION_ID');
  const certificationIdentifier = isPgs ? certificateMemberId : certificateNumber;

  const hasDetails = !isPursuing && !!(certificationIdentifier || documentFileName);

  const statusTranslation = {
    [ACTIVE]: t('common:ACTIVE'),
    [EXPIRING_SOON]: t('common:EXPIRING_SOON'),
    [EXPIRED]: t('common:EXPIRED'),
  };

  return (
    <div className={clsx(styles.card, styles[status])}>
      <div className={clsx(styles.cardMain)}>
        <div className={styles.cardBody}>
          <AwardIcon className={styles.cardAwardIcon} aria-hidden />
          <div className={styles.cardTitles}>
            <div className={styles.cardTitle}>{title}</div>
            <div className={styles.cardSubtitle}>{subtitle}</div>
          </div>
        </div>

        <div className={styles.cardMeta}>
          {!isPursuing && (
            <span className={clsx(styles.cardStatusBadge, styles[status])}>
              {statusTranslation[status]}
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
            {onDelete && (
              <button
                type="button"
                className={styles.iconBtn}
                onClick={onDelete}
                aria-label={t('common:DELETE')}
              >
                <TrashIcon />
              </button>
            )}
          </div>
        </div>
      </div>

      {hasDetails && (
        <div className={styles.cardDetails}>
          {certificationIdentifier && (
            <div className={styles.cardDetail}>
              <div className={styles.cardDetailLabel}>{identifierLabel}</div>
              <div className={styles.cardDetailValue}>{certificationIdentifier}</div>
            </div>
          )}
          {documentFileName && (
            <div className={clsx(styles.cardDetail, styles.cardDocument)}>
              <div className={styles.cardDetailLabel}>
                {t('CERTIFICATION.CERTIFICATE_DOCUMENT')}
              </div>
              <div className={clsx(styles.cardDetailValue, styles.cardDocumentName)}>
                <DocumentIcon aria-hidden />
                {documentFileName}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
