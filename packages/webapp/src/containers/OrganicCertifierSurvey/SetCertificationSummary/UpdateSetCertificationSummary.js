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
    console.log(persistedFormData);
    // history.push('/certification', { success: true });
  };
  const { isRequestedCertification, certificationName } = useCertificationName();
  const certifiers = useCertifiers();
  const onGoBack = () => {
    isRequestedCertification || certifiers.length < 1
      ? history.push(requestCertifierPath)
      : history.push(selectCertifierPath);
  };
  const { certifierName, isRequestedCertifier } = useCertifierName();
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
