import { useSelector } from 'react-redux';
import { certifierSurveySelector } from './slice';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { useCallback, useMemo } from 'react';
import { certifiersByCertificationSelector, certifiersSelector } from './certifierSlice';

export function useCertifiers() {
  const survey = useSelector(certifierSurveySelector);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const certification_id = persistedFormData.certification_id ?? survey.certification_id;
  const certifiers = useSelector(certifiersByCertificationSelector(certification_id));
  return useMemo(
    () => certifiers.filter((certifier) => certifier.certification_id === certification_id),
    [certifiers, certification_id],
  );
}

export function useGetCertifiers() {
  const certifiers = useSelector(certifiersSelector);
  return useCallback(
    (certification_id) =>
      certifiers.filter((certifier) => certifier.certification_id === certification_id),
    [certifiers],
  );
}
