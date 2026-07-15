import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PureCertificationSurveyPage from '../../../components/CertificationSurvey';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import { certifierSelector } from '../../OrganicCertifierSurvey/certifierSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { exportCertificationData } from '../saga';
import { setSubmissionIdCertificationFormData } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { userFarmSelector } from '../../userFarmSlice';

function CertificationSurveyPage() {
  const history = useHistory();
  const dispatch = useDispatch();
  const onExport = (exportData) => {
    const { certifier, ...rest } = exportData;
    const separatorIndex = certifier.indexOf(':');
    const type = certifier.slice(0, separatorIndex);
    const value = certifier.slice(separatorIndex + 1);

    dispatch(
      exportCertificationData({
        ...rest,
        ...(type === 'ID' ? { certifier_id: Number(value) } : { other_certifier: value }),
      }),
    );
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
        handleGoBack={() => history.back()}
        handleCancel={() => history.push('/certification')}
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
