import { useEffect } from 'react';
import PureCertificationReportingPeriod from '../../../components/CertificationReportingPeriod';
import { useSelector } from 'react-redux';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { userFarmSelector } from '../../userFarmSlice';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import { useNavigate } from 'react-router-dom-v5-compat';

function CertificationReportingPeriod() {
  let navigate = useNavigate();
  const { email } = useSelector(userFarmSelector);
  const { interested } = useSelector(certifierSurveySelector);
  const onError = (error) => {
    console.log(error);
  };
  const onContinue = (data) => {
    navigate('/certification/survey');
  };

  useEffect(() => {
    if (!interested) navigate('/certification');
  }, []); //TODO: create check in routes file?

  return (
    <HookFormPersistProvider>
      <PureCertificationReportingPeriod
        onSubmit={onContinue}
        onError={onError}
        handleGoBack={() => navigate(-1)}
        defaultEmail={email}
      />
    </HookFormPersistProvider>
  );
}

export default CertificationReportingPeriod;
