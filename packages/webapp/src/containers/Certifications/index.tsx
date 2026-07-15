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

import { useEffect, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PureCertifications from '../../components/Certifications';
import { loginSelector } from '../userFarmSlice';
import {
  useGetCertificationsQuery,
  useDeleteCertificationMutation,
} from '../../store/api/certificationsApi';
import {
  useGetSupportedCertifiersQuery,
  useGetSupportedCertificationSystemTypesQuery,
} from '../../store/api/certifiersApi';
import { toCertificationItems } from './utils';
import Layout from '../../components/Layout';

interface CertificationsProps {
  isCompactSideMenu: boolean;
}

export default function Certifications({ isCompactSideMenu }: CertificationsProps) {
  const { t } = useTranslation(['translation', 'common', 'certifications']);
  const location = useLocation();
  const history = useHistory();
  const { farm_id } = useSelector(loginSelector);
  const { data: rawCertifications = [] } = useGetCertificationsQuery();
  const { data: certifiers = [] } = useGetSupportedCertifiersQuery(farm_id!);
  const { data: systemTypes = [] } = useGetSupportedCertificationSystemTypesQuery(farm_id!);
  const [deleteCertification] = useDeleteCertificationMutation();

  // Captured once on mount so the banner stays visible for this page visit even after
  // the underlying history state is cleared below.
  const showSavedBannerRef = useRef(Boolean((location.state as any)?.certificationSaved));

  // Consume certificationSaved once: it's attached to this history entry's state, so
  // without clearing it, navigating to edit and back later would resurface the banner
  // even though nothing was just saved.
  useEffect(() => {
    if ((location.state as any)?.certificationSaved) {
      history.replace(location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const certifications = toCertificationItems(rawCertifications, systemTypes, certifiers, t);

  const onExport = () => {
    history.push('/certification/report_period');
  };

  return (
    <Layout footer={false}>
      <PureCertifications
        certifications={certifications}
        bannerVariant={showSavedBannerRef.current ? 'success' : 'info'}
        marketDirectoryProfileLink="/farm_settings/market_directory"
        isCompactSideMenu={isCompactSideMenu}
        onExport={onExport}
        onAddCertification={() => history.push('/certifications/add_certification')}
        onEditCertification={(id) => history.push(`/certifications/${id}/edit_certification`)}
        onDeleteCertification={deleteCertification}
      />
    </Layout>
  );
}
