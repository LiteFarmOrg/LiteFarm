import { PureCertifierSelectionScreen } from '../../../components/OrganicCertifierSurvey/CertifierSelection/PureCertifierSelectionScreen';
import { useDispatch, useSelector } from 'react-redux';
import { certifiersByCertificationSelector } from '../certifierSlice';
import { certifierSurveySelector } from '../slice';
import { setCertifierId } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { useCertificationName } from '../useCertificationName';
import { useNavigate } from 'react-router-dom-v5-compat';

export default function CertifierSelectionMenu() {
  let navigate = useNavigate();
  const survey = useSelector(certifierSurveySelector);
  const summaryPath = '/certification/summary';
  const certificationSelectionPath = '/certification/selection';
  const requestCertifierPath = '/certification/certifier/request';
  const { persistedData } = useHookFormPersist(
    () => ({}),
    [summaryPath, certificationSelectionPath, requestCertifierPath],
  );
  const certification_id = persistedData.certification_id ?? survey.certification_id;
  const { certificationName } = useCertificationName();
  const certifiers = useSelector(certifiersByCertificationSelector(certification_id));
  const dispatch = useDispatch();

  const onSubmit = () => {
    navigate(summaryPath);
  };

  const onBack = () => {
    navigate(certificationSelectionPath);
  };
  const onRequestCertifier = () => {
    navigate(requestCertifierPath);
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
