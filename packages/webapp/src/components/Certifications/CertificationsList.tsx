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
import CertificationCard from './CertificationCard';
import type { CertificationItem } from './types';
import styles from './index.module.scss';

interface CertificationsListProps {
  certifications: CertificationItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CertificationsList({
  certifications,
  onEdit,
  onDelete,
}: CertificationsListProps) {
  const { t } = useTranslation('translation');

  const activeCerts = certifications
    .filter((cert) => cert.isActive)
    .sort((a, b) => b.expiryDate!.localeCompare(a.expiryDate!));
  const pursuingCerts = certifications.filter((cert) => !cert.isActive);

  return (
    <div className={styles.list}>
      {activeCerts.length > 0 && (
        <div className={styles.listSection}>
          <h3>{t('CERTIFICATION.LIST.ACTIVE_SECTION')}</h3>
          <div className={clsx(styles.listCards, styles.active)}>
            {activeCerts.map((cert) => (
              <CertificationCard
                key={cert.id}
                {...cert}
                onEdit={() => onEdit(cert.id)}
                onDelete={() => onDelete(cert.id)}
              />
            ))}
          </div>
        </div>
      )}

      {pursuingCerts.length > 0 && (
        <div className={styles.listSection}>
          <h3>{t('CERTIFICATION.LIST.PURSUING_SECTION')}</h3>
          <div className={clsx(styles.listCards, styles.pursuing)}>
            {pursuingCerts.map((cert) => (
              <CertificationCard
                key={cert.id}
                {...cert}
                onEdit={() => onEdit(cert.id)}
                onDelete={() => onDelete(cert.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
