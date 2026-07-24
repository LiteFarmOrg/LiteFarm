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
import { useHistory } from 'react-router-dom';
import { toCertificationItems } from '../../../../Certifications/utils';
import CertificationsEmptyState from '../../../../../components/Certifications/CertificationsEmptyState';
import CertificationCard, {
  getCertificationStatus,
} from '../../../../../components/Certifications/CertificationCard';
import {
  Certification,
  SupportedCertificationSystemType,
  SupportedCertifier,
} from '../../../../../store/api/types';
import certificationStyles from '../../../../../components/Certifications/index.module.scss';
import styles from './styles.module.scss';

interface MarketDirectoryCertificationsProps {
  certifications: Certification[];
  systemTypes: SupportedCertificationSystemType[];
  certifiers: SupportedCertifier[];
}
export default function MarketDirectoryCertifications({
  certifications,
  systemTypes,
  certifiers,
}: MarketDirectoryCertificationsProps) {
  const history = useHistory();

  const certificationItems = toCertificationItems(certifications, systemTypes, certifiers);

  // Only certifications that are actually publishable (active and not expired) belong on this read-only summary
  const publishableCertifications = certificationItems.filter(
    (cert) =>
      !['expired', 'pursuing'].includes(getCertificationStatus(cert.isActive, cert.expiryDate)),
  );

  return publishableCertifications.length === 0 ? (
    <CertificationsEmptyState
      className={styles.emptyState}
      onAddCertification={() => history.push('/certifications/add_certification')}
    />
  ) : (
    <div className={clsx(certificationStyles.listCards, certificationStyles.active, styles.list)}>
      {publishableCertifications.map((cert) => (
        <CertificationCard
          key={cert.id}
          {...cert}
          onEdit={() => history.push(`/certifications/${cert.id}/edit_certification`)}
        />
      ))}
    </div>
  );
}
