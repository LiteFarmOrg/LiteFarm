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

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../Form/Button';
import CertificationBanner from './CertificationBanner';
import CertificationsEmptyState from './CertificationsEmptyState';
import CertificationsList from './CertificationsList';
import DeleteConfirmationModal from '../Modals/DeleteConfirmationModal';
import type { CertificationItem } from './types';
import styles from './index.module.scss';

interface CertificationsPageProps {
  certifications: CertificationItem[];
  onAddCertification: () => void;
  onEditCertification: (id: string) => void;
  onDeleteCertification: (id: string) => void;
}

export default function CertificationsPage({
  certifications,
  onAddCertification,
  onEditCertification,
  onDeleteCertification,
}: CertificationsPageProps) {
  const { t } = useTranslation('translation');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDeleteConfirm() {
    if (deletingId !== null) {
      onDeleteCertification(deletingId);
    }
    setDeletingId(null);
  }

  return (
    <div className={styles.page}>
      <CertificationBanner />

      {certifications.length === 0 ? (
        <CertificationsEmptyState onAddCertification={onAddCertification} />
      ) : (
        <>
          <CertificationsList
            certifications={certifications}
            onEdit={onEditCertification}
            onDelete={setDeletingId}
          />
          <Button className={styles.pageAddBtn} color="secondary" onClick={onAddCertification} sm>
            {t('CERTIFICATION.CERTIFICATION_EXPORT.ADD')}
          </Button>
        </>
      )}

      {deletingId !== null && (
        <DeleteConfirmationModal
          subject={t('CERTIFICATION.DELETE_SUBJECT')}
          onClose={() => setDeletingId(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
