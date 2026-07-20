import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
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
  const history = useHistory();
  const { t } = useTranslation(['translation', 'certifications']);
  const { email, farm_id } = useSelector(userFarmSelector);
  const { data: certifications = [] } = useGetCertificationsQuery();
  const { data: certifiers = [] } = useGetSupportedCertifiersQuery(farm_id);
  const { data: systemTypes = [] } = useGetSupportedCertificationSystemTypesQuery(farm_id);

  const onError = (error) => {
    console.log(error);
  };
  const onContinue = (data) => {
    history.push('/certification/survey');
  };

  useEffect(() => {
    if (certifications.length === 0) {
      history.push('/certifications');
    }
  }, [certifications]);

  const certifierOptions = getCertifierOptions(certifications, systemTypes, certifiers, t);

  return (
    <HookFormPersistProvider>
      <PureCertificationReportingPeriod
        onSubmit={onContinue}
        onError={onError}
        handleGoBack={() => history.back()}
        defaultEmail={email}
        certifierOptions={certifierOptions}
      />
    </HookFormPersistProvider>
  );
}

export default CertificationReportingPeriod;
