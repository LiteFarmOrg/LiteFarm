import { PureSetCertificationSummary } from '../../../components/OrganicCertifierSurvey/SetCertificationSummary/PureSetCertificationSummary';
import { useDispatch, useSelector } from 'react-redux';
import { useCertificationName } from '../useCertificationName';
import { useCertifiers } from '../useCertifiers';
import { useCertifierName } from '../useCertifierName';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getOrganicSurveyReqBody } from './utils/getOrganicSurveyReqBody';
import { putOrganicCertifierSurvey } from '../saga';
import { useNavigate } from 'react-router';

export default function UpdateSetCertificationSummary() {
  let navigate = useNavigate();
  const persistedFormData = useSelector(hookFormPersistSelector);
  const requestCertifierPath = '/certification/certifier/request';
  const selectCertifierPath = '/certification/certifier/selection';
  const dispatch = useDispatch();
  const onSubmit = () => {
    const data = getOrganicSurveyReqBody(persistedFormData);
    const callback = () => navigate('/certification', { state: { success: true } });
    dispatch(putOrganicCertifierSurvey({ survey: data, callback }));
  };
  const { certifierName, isRequestedCertifier } = useCertifierName();
  const { certificationName } = useCertificationName();
  const certifiers = useCertifiers();
  const onGoBack = () => {
    isRequestedCertifier || certifiers.length < 1
      ? navigate(requestCertifierPath)
      : navigate(selectCertifierPath);
  };

  useHookFormPersist(() => ({}), [requestCertifierPath, selectCertifierPath]);
  return (
    <PureSetCertificationSummary
      onSubmit={onSubmit}
      onGoBack={onGoBack}
      certificationName={certificationName}
      certifierName={certifierName}
      isRequestedCertifier={isRequestedCertifier}
    />
  );
}
