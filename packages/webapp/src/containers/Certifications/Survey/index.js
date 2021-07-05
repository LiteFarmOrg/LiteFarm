import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PureCertificationSurveyPage from '../../../components/CertificationSurvey';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import { certifierSelector } from '../../OrganicCertifierSurvey/certifierSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { exportCertificationData } from '../saga';

function CertificationSurveyPage({ history, match }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const onExport = (exportData) => {
    dispatch(exportCertificationData(exportData));
  };

  const certifierSurvey = useSelector(certifierSurveySelector);
  const certifier = useSelector(certifierSelector);
  const { interested, requested_certifier } = certifierSurvey;

  return (
    <HookFormPersistProvider>
      <PureCertificationSurveyPage
        onExport={onExport}
        handleGoBack={() => history.push('/certification/report_period')}
        handleCancel={() => history.push('/certification')}
        certifierSurvey={certifierSurvey}
        interested={interested}
        certifier={certifier}
        requested_certifier={requested_certifier}
      />
    </HookFormPersistProvider>
  );
}

export default CertificationSurveyPage;
