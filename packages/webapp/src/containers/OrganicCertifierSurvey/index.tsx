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

import { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getAllSupportedCertifications, getAllSupportedCertifiers } from './saga';
import PureCertifications from '../../components/Certifications';

interface CertificationProps {
  isCompactSideMenu: boolean;
}

export default function Certification({ isCompactSideMenu }: CertificationProps) {
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const certificationSaved = (location?.state as any)?.certificationSaved; // TODO LF-5379

  useEffect(() => {
    dispatch(getAllSupportedCertifications());
    dispatch(getAllSupportedCertifiers());
  }, []);

  const onExport = () => {
    history.push('/certification/report_period');
  };

  return (
    <PureCertifications
      certifications={[]} // TODO LF-5379
      bannerVariant={certificationSaved ? 'success' : 'info'}
      marketDirectoryProfileLink="/farm_settings/market_directory"
      isCompactSideMenu={isCompactSideMenu}
      onExport={onExport}
      onAddCertification={() => ({})} // TODO LF-5379
      onEditCertification={() => ({})} // TODO LF-5379
      onDeleteCertification={() => ({})} // TODO LF-5379
    />
  );
}
