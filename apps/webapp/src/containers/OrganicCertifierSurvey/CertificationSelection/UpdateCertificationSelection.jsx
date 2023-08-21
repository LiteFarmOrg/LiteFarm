import React from 'react';
import {
  PureCertificationSelection,
} from '../../../components/OrganicCertifierSurvey/CertificationSelection/PureCertificationSelection';
import { useSelector } from 'react-redux';
import history from '../../../history';
import { certificationsSelector } from '../certificationSlice';
import { certifierSurveySelector } from '../slice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useGetCertifiers } from '../useCertifiers';

export default function CertificationSelection() {
  const survey = useSelector(certifierSurveySelector);

  const certifications = useSelector(certificationsSelector);

  const requestCertifierPath = '/certification/certifier/request';
  const selectCertifierPath = '/certification/certifier/selection';
  const interestedInOrganicPath = '/certification/interested_in_organic';
  const getCertifiers = useGetCertifiers();
  const onSubmit = (data) => {
    const certifiers = getCertifiers(data.certification_id);
    if (data.certification_id === 0 || certifiers.length === 0) {
      history.push(requestCertifierPath);
    } else {
      history.push(selectCertifierPath);
    }
  };

  const onGoBack = () => {
    history.push(interestedInOrganicPath);
  };

  return (
    <HookFormPersistProvider>
      <PureCertificationSelection
        onSubmit={onSubmit}
        onGoBack={onGoBack}
        certifications={certifications}
        survey={survey}
        persistedPathNames={[requestCertifierPath, selectCertifierPath, interestedInOrganicPath]}
      />
    </HookFormPersistProvider>
  );
}
