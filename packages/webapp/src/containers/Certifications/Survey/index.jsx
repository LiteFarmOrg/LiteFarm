import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PureCertificationSurveyPage from '../../../components/CertificationSurvey';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import { certifierSelector } from '../../OrganicCertifierSurvey/certifierSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { exportCertificationData } from '../saga';
import { setSubmissionIdCertificationFormData } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { userFarmSelector } from '../../userFarmSlice';
import { useNavigate } from 'react-router';

function CertificationSurveyPage() {
  let navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const onExport = (exportData) => {
    dispatch(exportCertificationData(exportData));
  };

  const onSurveyComplete = (submissionId) => {
    dispatch(setSubmissionIdCertificationFormData(submissionId));
  };

  const certifierSurvey = useSelector(certifierSurveySelector);
  const certifier = useSelector(certifierSelector);
  const { interested, requested_certifier } = certifierSurvey;

  const { email } = useSelector(userFarmSelector);

  return (
    <HookFormPersistProvider>
      <PureCertificationSurveyPage
        onExport={onExport}
        handleGoBack={() => navigate(-1)}
        handleCancel={() => navigate('/certification')}
        certifierSurvey={certifierSurvey}
        interested={interested}
        certifier={certifier}
        requested_certifier={requested_certifier}
        onSurveyComplete={onSurveyComplete}
        email={email}
      />
    </HookFormPersistProvider>
  );
}

export default CertificationSurveyPage;
