import { useSelector } from 'react-redux';
import { certifierSurveySelector } from './slice';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { certifierByCertifierIdSelector } from './certifierSlice';

export function useCertifierName() {
  const survey = useSelector(certifierSurveySelector);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const certifier_id = persistedFormData?.certifier_id ?? survey?.certifier_id;
  const certifier = useSelector(certifierByCertifierIdSelector(certifier_id));
  const certifierName =
    persistedFormData?.requested_certifier ||
    certifier?.certifier_name ||
    survey?.requested_certifier;
  const isRequestedCertifier = !!persistedFormData.requested_certifier || !certifier_id;
  return { certifierName, isRequestedCertifier };
}
