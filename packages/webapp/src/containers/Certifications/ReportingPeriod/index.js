import React, { useEffect } from 'react';
import PureCertificationReportingPeriod from '../../../components/CertificationReportingPeriod';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { useTranslation } from 'react-i18next';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { userFarmSelector } from '../../userFarmSlice';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';

function CertificationReportingPeriod({ history, match }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const persistedFormData = useSelector(hookFormPersistSelector);
  const { email } = useSelector(userFarmSelector);
  const { interested } = useSelector(certifierSurveySelector);
  const onError = (error) => {
    console.log(error);
  };
  const onContinue = (data) => {
    // TODO: dispatch action and history push
    console.log(data);
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
        handleGoBack={() => history.push('/certification')}
        handleCancel={() => history.push('/certification')}
        defaultEmail={email}
      />
    </HookFormPersistProvider>
  );
}

export default CertificationReportingPeriod;
