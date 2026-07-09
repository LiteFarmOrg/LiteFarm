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
import { ReactComponent as AwardIcon } from '../../assets/images/award-01.svg';
import { ReactComponent as EditIcon } from '../../assets/images/edit-05.svg';
import { ReactComponent as TrashIcon } from '../../assets/images/trash-03.svg';
import type { CertificationStatus } from './types';
import styles from './index.module.scss';

interface CertificationCardProps {
  certificationSystemType: string;
  certifierName: string;
  certificationIdentifier?: string | null;
  status: CertificationStatus;
  expiryDate?: string | null;
  onEdit: () => void;
  onDelete: () => void;
}

const STATUS_KEYS: Record<CertificationStatus, string> = {
  active: 'CERTIFICATIONS.STATUS.ACTIVE',
  expiring_soon: 'CERTIFICATIONS.STATUS.EXPIRING_SOON',
  expired: 'CERTIFICATIONS.STATUS.EXPIRED',
  pursuing: 'CERTIFICATIONS.STATUS.PURSUING',
};

export default function CertificationCard({
  certificationSystemType,
  certifierName,
  certificationIdentifier,
  status,
  expiryDate,
  onEdit,
  onDelete,
}: CertificationCardProps) {
  const { t } = useTranslation(['translation', 'common']);
  const isPursuing = status === 'pursuing';

  return (
    <div className={styles.card}>
      <AwardIcon className={styles.cardAwardIcon} aria-hidden />

      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <span className={styles.cardCertName}>{certificationSystemType}</span>
          <span className={clsx(styles.cardStatusBadge, styles[status])}>
            {t(STATUS_KEYS[status])}
          </span>
        </div>

        <span className={styles.cardCertifier}>{certifierName}</span>

        {!isPursuing && certificationIdentifier && (
          <span className={styles.cardIdentifier}>{certificationIdentifier}</span>
        )}

        {!isPursuing && expiryDate && <span className={styles.cardExpiry}>{expiryDate}</span>}
      </div>

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
  );
}
