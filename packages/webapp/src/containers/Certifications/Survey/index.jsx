import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PureCertificationSurveyPage from '../../../components/CertificationSurvey';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import {
  hookFormPersistSelector,
  setSubmissionIdCertificationFormData,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { exportCertificationData } from '../saga';
import { userFarmSelector } from '../../userFarmSlice';
import { useGetSupportedCertifiersQuery } from '../../../store/api/certifiersApi';
import { parseCertifierKey } from '../utils';

function CertificationSurveyPage() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { email, farm_id } = useSelector(userFarmSelector);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const { data: certifiers = [] } = useGetSupportedCertifiersQuery(farm_id);

  const onExport = (exportData) => {
    const { certifier, ...rest } = exportData;
    const { type, value } = parseCertifierKey(certifier);

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

  // Determine which survey variant to show based on the certifier
  // selected in the reporting-period step.
  let certifier = {};
  let requested_certifier;
  if (persistedFormData?.certifier) {
    const { type, value } = parseCertifierKey(persistedFormData.certifier);
    if (type === 'ID') {
      const found = certifiers.find((c) => c.certifier_id === Number(value));
      certifier = { certifier_acronym: found?.certifier_acronym, survey_id: found?.survey_id };
    } else {
      requested_certifier = value;
    }
  }

  return (
    <HookFormPersistProvider>
      <PureCertificationSurveyPage
        onExport={onExport}
        handleGoBack={() => history.back()}
        handleCancel={() => history.push('/certification')}
        certifier={certifier}
        requested_certifier={requested_certifier}
        onSurveyComplete={onSurveyComplete}
        email={email}
      />
    </HookFormPersistProvider>
  );
}

export default CertificationSurveyPage;
