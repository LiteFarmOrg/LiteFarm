import { certifierSurveyProperties } from '../../slice';
import { pick } from '../../../../util/pick';

export const getOrganicSurveyReqBody = (persistedFormData) => {
  return persistedFormData.interested
    ? {
        ...pick(persistedFormData, certifierSurveyProperties),
        certification_id:
          persistedFormData.certification_id === 0 ? null : persistedFormData.certification_id,
        certifier_id: persistedFormData.requested_certifier ? null : persistedFormData.certifier_id,
        requested_certification:
          persistedFormData.certification_id === 0
            ? persistedFormData.requested_certification
            : null,
        requested_certifier: persistedFormData.requested_certifier
          ? persistedFormData.requested_certifier
          : null,
        farm_id: undefined,
      }
    : {
        certification_id: null,
        certifier_id: null,
        farm_id: undefined,
        interested: false,
        requested_certification: null,
        requested_certifier: null,
        survey_id: persistedFormData.survey_id,
      };
};
