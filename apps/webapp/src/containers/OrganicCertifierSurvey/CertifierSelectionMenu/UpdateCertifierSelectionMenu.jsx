import React from 'react';
import {
  PureCertifierSelectionScreen,
} from '../../../components/OrganicCertifierSurvey/CertifierSelection/PureCertifierSelectionScreen';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../../history';
import { certifiersByCertificationSelector } from '../certifierSlice';
import { certifierSurveySelector } from '../slice';
import { setCertifierId } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { useCertificationName } from '../useCertificationName';

export default function CertifierSelectionMenu() {
  const survey = useSelector(certifierSurveySelector);
  const summaryPath = '/certification/summary';
  const certificationSelectionPath = '/certification/selection';
  const requestCertifierPath = '/certification/certifier/request';
  const { persistedData } = useHookFormPersist(() => ({}), [
    summaryPath,
    certificationSelectionPath,
    requestCertifierPath,
  ]);
  const certification_id = persistedData.certification_id ?? survey.certification_id;
  const { certificationName } = useCertificationName();
  const certifiers = useSelector(certifiersByCertificationSelector(certification_id));
  const dispatch = useDispatch();

  const onSubmit = () => {
    history.push(summaryPath);
  };

  const onBack = () => {
    history.push(certificationSelectionPath);
  };
  const onRequestCertifier = () => {
    history.push(requestCertifierPath);
  };
  const onSelectCertifier = (certifier_id) => {
    dispatch(setCertifierId(certifier_id));
  };

  const certifier_id = persistedData.requested_certifier
    ? undefined
    : persistedData.certifier_id || survey.certifier_id;

  return (
    <PureCertifierSelectionScreen
      certifiers={certifiers}
      onSubmit={onSubmit}
      onBack={onBack}
      onRequestCertifier={onRequestCertifier}
      certificationName={certificationName}
      onSelectCertifier={onSelectCertifier}
      certifier_id={certifier_id}
    />
  );
}
