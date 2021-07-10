import React from 'react';
import { PureCertifierSelectionScreen } from '../../../components/OrganicCertifierSurvey/CertifierSelection/PureUpdateCertifierSelectionScreen';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../../history';
import { certifiersByCertificationSelector } from '../certifierSlice';
import { certifierSurveySelector } from '../slice';
import {
  hookFormPersistSelector,
  setCertifierId,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { useCertificationName } from '../useCertificationName';

export default function CertifierSelectionMenu() {
  const survey = useSelector(certifierSurveySelector);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const certification_id = persistedFormData.certification_id ?? survey.certification_id;
  const { certificationName } = useCertificationName();
  const certifiers = useSelector(certifiersByCertificationSelector(certification_id));
  const dispatch = useDispatch();
  const summaryPath = '/certification/summary';
  const certificationSelectionPath = '/certification/selection';
  const requestCertifierPath = '/certification/certifier/request';
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
  useHookFormPersist([summaryPath, certificationSelectionPath, requestCertifierPath], () => ({}));

  return (
    <PureCertifierSelectionScreen
      certifiers={certifiers}
      onSubmit={onSubmit}
      onBack={onBack}
      onRequestCertifier={onRequestCertifier}
      certificationName={certificationName}
      onSelectCertifier={onSelectCertifier}
      survey={survey}
    />
  );
}
