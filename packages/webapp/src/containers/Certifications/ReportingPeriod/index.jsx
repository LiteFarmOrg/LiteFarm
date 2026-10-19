import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PureCertificationReportingPeriod from '../../../components/CertificationReportingPeriod';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { userFarmSelector } from '../../userFarmSlice';
import { useGetCertificationsQuery } from '../../../store/api/certificationsApi';
import {
  useGetSupportedCertificationSystemTypesQuery,
  useGetSupportedCertifiersQuery,
} from '../../../store/api/certifiersApi';
import { getCertifierOptions } from '../utils';

function CertificationReportingPeriod() {
  const navigate = useNavigate();
  const { t } = useTranslation(['translation', 'certifications']);
  const { email } = useSelector(userFarmSelector);
  const { data: certifications = [] } = useGetCertificationsQuery();
  const { data: certifiers = [] } = useGetSupportedCertifiersQuery();
  const { data: systemTypes = [] } = useGetSupportedCertificationSystemTypesQuery();

  const onError = (error) => {
    console.log(error);
  };
  const onContinue = (data) => {
    navigate('/certification/survey');
  };

  useEffect(() => {
    if (certifications.length === 0) {
      navigate('/certifications');
    }
  }, [certifications]);

  const certifierOptions = getCertifierOptions(certifications, systemTypes, certifiers, t);

  return (
    <HookFormPersistProvider>
      <PureCertificationReportingPeriod
        onSubmit={onContinue}
        onError={onError}
        handleGoBack={() => navigate(-1)}
        defaultEmail={email}
        certifierOptions={certifierOptions}
      />
    </HookFormPersistProvider>
  );
}

export default CertificationReportingPeriod;
