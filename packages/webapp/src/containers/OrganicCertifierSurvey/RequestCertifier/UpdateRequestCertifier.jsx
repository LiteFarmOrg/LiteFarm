import { useMemo } from 'react';
import { PureRequestCertifier } from '../../../components/OrganicCertifierSurvey/RequestCertifier/PureRequestCertifier';
import { useDispatch, useSelector } from 'react-redux';
import { certifiersSelector } from '../certifierSlice';
import { certifierSurveySelector } from '../slice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { useCertificationName } from '../useCertificationName';
import { useNavigate } from 'react-router';

export default function RequestCertifier() {
  let navigate = useNavigate();
  const survey = useSelector(certifierSurveySelector);

  const dispatch = useDispatch();
  const { certificationName, isRequestedCertification } = useCertificationName();

  const persistedFormData = useSelector(hookFormPersistSelector);
  const certification_id = persistedFormData.certification_id ?? survey.certification_id;
  const summaryPath = '/certification/summary';
  const selectCertificationPath = '/certification/selection';
  const selectCertifierPath = '/certification/certifier/selection';

  const onSubmit = (data) => {
    navigate(summaryPath);
  };
  const certifiers = useSelector(certifiersSelector);
  const certifiersByCertificationId = useMemo(
    () => certifiers.filter((certifier) => certifier.certification_id === certification_id),
    [certifiers, certification_id],
  );

  const onGoBack = () => {
    certification_id === 0 || certifiersByCertificationId.length < 1
      ? navigate(selectCertificationPath)
      : navigate(selectCertifierPath);
  };

  return (
    <HookFormPersistProvider>
      <PureRequestCertifier
        onSubmit={onSubmit}
        onGoBack={onGoBack}
        certificationName={certificationName}
        isRequestedCertification={isRequestedCertification}
        hasSupportedCertifiers={certifiersByCertificationId.length}
        persistedPathNames={[selectCertifierPath, summaryPath, selectCertificationPath]}
        survey={survey}
      />
    </HookFormPersistProvider>
  );
}
