import React from 'react';
import { PureSetCertificationSummary } from '../../../components/OrganicCertifierSurvey/SetCertificationSummary/PureSetCertificationSummary';
import { useSelector } from 'react-redux';
import { useCertificationName } from '../useCertificationName';
import { useCertifiers } from '../useCertifiers';
import { useCertifierName } from '../useCertifierName';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';

export default function UpdateSetCertificationSummary({ history }) {
  const persistedFormData = useSelector(hookFormPersistSelector);
  const requestCertifierPath = '/certification/certifier/request';
  const selectCertifierPath = '/certification/certifier/selection';

  const onSubmit = () => {
    const data = {
      ...persistedFormData,
      certification_id:
        persistedFormData.certification_id === 0 ? undefined : persistedFormData.certification_id,
      certifier_id: persistedFormData.requested_certifier
        ? undefined
        : persistedFormData.certifier_id,
      requested_certification:
        persistedFormData.certification_id === 0
          ? persistedFormData.requested_certification
          : undefined,
    };
    console.log(data);
    // history.push('/certification', { success: true });
  };
  const { certifierName, isRequestedCertifier } = useCertifierName();
  const { certificationName } = useCertificationName();
  const certifiers = useCertifiers();
  const onGoBack = () => {
    isRequestedCertifier || certifiers.length < 1
      ? history.push(requestCertifierPath)
      : history.push(selectCertifierPath);
  };

  useHookFormPersist([requestCertifierPath, selectCertifierPath], () => ({}));
  return (
    <PureSetCertificationSummary
      onSubmit={onSubmit}
      onGoBack={onGoBack}
      certificationName={certificationName}
      certifierName={certifierName}
      isRequestedCertifier={isRequestedCertifier}
    />
  );
}
