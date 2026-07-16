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
import { useMediaQuery, useTheme } from '@mui/material';
import Button from '../Form/Button';
import FloatingActionButton from '../Button/FloatingActionButton';
import FloatingContainer from '../FloatingContainer';
import CertificationBanner from './CertificationBanner';
import CertificationsEmptyState from './CertificationsEmptyState';
import CertificationsList from './CertificationsList';
import DeleteConfirmationModal from '../Modals/DeleteConfirmationModal';
import { ReactComponent as PlusCircleIcon } from '../../assets/images/plus-circle.svg';
import { ReactComponent as ExportIcon } from '../../assets/images/finance/Report-icn.svg';
import type { CertificationItem } from './types';
import styles from './index.module.scss';

interface CertificationsProps {
  certifications: CertificationItem[];
  bannerVariant: 'info' | 'success';
  marketDirectoryProfileLink: string;
  isCompactSideMenu: boolean;
  onAddCertification: () => void;
  onExport: () => void;
  onEditCertification: (id: string) => void;
  onDeleteCertification: (id: string) => Promise<void>;
  isSaving: boolean;
}

export default function Certifications({
  certifications,
  bannerVariant,
  marketDirectoryProfileLink,
  isCompactSideMenu,
  onAddCertification,
  onExport,
  onEditCertification,
  onDeleteCertification,
  isSaving,
}: CertificationsProps) {
  const { t } = useTranslation('translation');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  async function handleDeleteConfirm() {
    if (deletingId) {
      await onDeleteCertification(deletingId);
    }
    setDeletingId(null);
  }

  return (
    <div className={styles.page}>
      <CertificationBanner
        variant={bannerVariant}
        marketDirectoryProfileLink={marketDirectoryProfileLink}
      />

      {certifications.length === 0 ? (
        <CertificationsEmptyState onAddCertification={onAddCertification} />
      ) : (
        <>
          <CertificationsList
            certifications={certifications}
            onEdit={onEditCertification}
            onDelete={setDeletingId}
          />
          {isMobile ? (
            <div className={styles.pageFabWrapper}>
              <FloatingActionButton
                // @ts-expect-error known issue with the JS component's props
                type="add"
                onClick={onAddCertification}
                aria-label={t('CERTIFICATION.ADD_CERTIFICATIONS')}
              />
            </div>
          ) : (
            <FloatingContainer isCompactSideMenu={isCompactSideMenu}>
              <div className={styles.pageActions}>
                <Button color="primary" md onClick={onAddCertification}>
                  <PlusCircleIcon />
                  {t('CERTIFICATION.ADD_CERTIFICATIONS')}
                </Button>
                <Button color="secondary" md onClick={onExport} className={styles.pageExportBtn}>
                  <ExportIcon />
                  {t('CERTIFICATIONS.EXPORT')}
                </Button>
              </div>
            </FloatingContainer>
          )}
        </>
      )}

      {deletingId !== null && (
        <DeleteConfirmationModal
          subject={t('CERTIFICATION.THIS_CERTIFICATION')}
          onClose={() => setDeletingId(null)}
          onConfirm={handleDeleteConfirm}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}
