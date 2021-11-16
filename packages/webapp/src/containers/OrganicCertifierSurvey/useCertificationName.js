import { useSelector } from 'react-redux';
import { certifierSurveySelector } from './slice';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { useTranslation } from 'react-i18next';
import { certificationByCertificationIdSelector } from './certificationSlice';

export function useCertificationName() {
  const { t } = useTranslation(['translation', 'common', 'certifications']);
  const survey = useSelector(certifierSurveySelector);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const certification_id = persistedFormData.certification_id ?? survey.certification_id;
  const certification = useSelector(certificationByCertificationIdSelector(certification_id));
  const isRequestedCertification = certification_id === 0;
  const certificationName = certification
    ? t(`certifications:${certification.certification_translation_key}`)
    : persistedFormData.requested_certification || survey.requested_certification;
  return { certificationName, isRequestedCertification };
}
