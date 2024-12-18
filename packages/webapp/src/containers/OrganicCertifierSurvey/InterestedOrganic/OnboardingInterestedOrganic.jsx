import { useEffect } from 'react';
import { PureInterestedOrganic } from '../../../components/OrganicCertifierSurvey/InterestedOrganic/PureInterestedOrganic';
import { useDispatch, useSelector } from 'react-redux';
import { certifierSurveySelector } from '../slice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { getOrganicSurveyReqBody } from '../SetCertificationSummary/utils/getOrganicSurveyReqBody';
import {
  getAllSupportedCertifications,
  getAllSupportedCertifiers,
  getCertificationSurveys,
  postOrganicCertifierSurvey,
  putOrganicCertifierSurvey,
} from '../saga';
import { setInterested } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { useNavigate } from 'react-router-dom';

export default function OnboardingInterestedOrganic() {
  let navigate = useNavigate();
  const survey = useSelector(certifierSurveySelector);
  const dispatch = useDispatch();

  const consentPath = '/consent';
  const onGoBack = () => {
    navigate(consentPath);
  };
  const certificationSelectionPath = '/certification/selection';
  const outroPath = '/outro';
  useEffect(() => {
    dispatch(getCertificationSurveys());
    dispatch(getAllSupportedCertifications());
    dispatch(getAllSupportedCertifiers());
  }, []);

  const onSubmit = (data) => {
    if (data.interested) {
      dispatch(setInterested(data.interested));
      navigate(certificationSelectionPath);
    } else {
      const callback = () => navigate(outroPath);
      if (survey.survey_id) {
        dispatch(
          putOrganicCertifierSurvey({
            survey: getOrganicSurveyReqBody({
              interested: false,
              survey_id: survey.survey_id,
            }),
            callback,
          }),
        );
      } else {
        dispatch(
          postOrganicCertifierSurvey({
            survey: getOrganicSurveyReqBody({ interested: false }),
            callback,
          }),
        );
      }
    }
  };

  return (
    <HookFormPersistProvider>
      <PureInterestedOrganic
        onSubmit={onSubmit}
        onGoBack={onGoBack}
        persistedPathNames={[certificationSelectionPath, outroPath, consentPath]}
        survey={survey}
      />
    </HookFormPersistProvider>
  );
}
