import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PureCertificationReportingPeriod from '../../../components/CertificationReportingPeriod';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { userFarmSelector } from '../../userFarmSlice';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import { useGetCertificationsQuery } from '../../../store/api/certificationsApi';
import {
  useGetSupportedCertificationSystemTypesQuery,
  useGetSupportedCertifiersQuery,
} from '../../../store/api/certifiersApi';

function CertificationReportingPeriod() {
  const history = useHistory();
  const { t } = useTranslation(['translation', 'certifications']);
  const { email, farm_id } = useSelector(userFarmSelector);
  const { interested } = useSelector(certifierSurveySelector);
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
    if (!interested) history.push('/certification');
  }, []); //TODO: create check in routes file?

  const certifiersMap = certifiers.reduce((map, certifier) => {
    map[certifier.certifier_id] = certifier;
    return map;
  }, {});
  const systemTypesMap = systemTypes.reduce((map, systemType) => {
    map[systemType.certification_id] = systemType;
    return map;
  }, {});

  const formatCertifierLabel = (certification) => {
    const systemType = systemTypesMap[certification.system_type_id];
    const systemTypeName = systemType
      ? t(`certifications:${systemType.certification_translation_key}`)
      : certification.requested_system_type;

    let certifierName;
    if (certification.certifier_id) {
      const certifier = certifiersMap[certification.certifier_id];
      certifierName = certifier?.certifier_acronym;
    } else {
      certifierName = certification.other_certifier;
    }

    return systemTypeName ? `${certifierName} - ${systemTypeName}` : certifierName;
  };

  // Same key is used for dedup grouping, the option's value, and (in the Survey
  // container's onExport) parsed back into certifier_id/other_certifier for the
  // export request body.
  const getCertifierKey = (certification) =>
    certification.certifier_id != null
      ? `ID:${certification.certifier_id}`
      : `OTHER:${certification.other_certifier}`;

  const certifierByUniqueKey = {};
  for (const certification of certifications) {
    const key = getCertifierKey(certification);
    if (!(key in certifierByUniqueKey)) {
      certifierByUniqueKey[key] = certification;
    }
  }

  const certifierOptions = Object.entries(certifierByUniqueKey)
    .map(([key, certification]) => ({
      value: key,
      label: formatCertifierLabel(certification),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

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
