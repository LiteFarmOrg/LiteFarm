import { PureCertificationSelection } from '../../../components/OrganicCertifierSurvey/CertificationSelection/PureCertificationSelection';
import { useSelector } from 'react-redux';
import { certificationsSelector } from '../certificationSlice';
import { certifierSurveySelector } from '../slice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useGetCertifiers } from '../useCertifiers';
import { useNavigate } from 'react-router-dom';

export default function CertificationSelection() {
  let navigate = useNavigate();
  const survey = useSelector(certifierSurveySelector);

  const certifications = useSelector(certificationsSelector);

  const requestCertifierPath = '/certification/certifier/request';
  const selectCertifierPath = '/certification/certifier/selection';
  const interestedInOrganicPath = '/certification/interested_in_organic';
  const getCertifiers = useGetCertifiers();
  const onSubmit = (data) => {
    const certifiers = getCertifiers(data.certification_id);
    if (data.certification_id === 0 || certifiers.length === 0) {
      navigate(requestCertifierPath);
    } else {
      navigate(selectCertifierPath);
    }
  };

  const onGoBack = () => {
    navigate(interestedInOrganicPath);
  };

  return (
    <HookFormPersistProvider>
      <PureCertificationSelection
        onSubmit={onSubmit}
        onGoBack={onGoBack}
        certifications={certifications}
        survey={survey}
        persistedPathNames={[requestCertifierPath, selectCertifierPath, interestedInOrganicPath]}
      />
    </HookFormPersistProvider>
  );
}
