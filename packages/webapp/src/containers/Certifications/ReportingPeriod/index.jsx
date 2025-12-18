import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import PureCertificationReportingPeriod from '../../../components/CertificationReportingPeriod';
import { useSelector } from 'react-redux';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { userFarmSelector } from '../../userFarmSlice';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';

function CertificationReportingPeriod() {
  const history = useHistory();
  const navigate = useNavigate();
  const { email } = useSelector(userFarmSelector);
  const { interested } = useSelector(certifierSurveySelector);
  const onError = (error) => {
    console.log(error);
  };
  const onContinue = (data) => {
    history.push('/certification/survey');
  };

  useEffect(() => {
    if (!interested) history.push('/certification');
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
