import React, { useEffect } from 'react';
import {
  PureInterestedOrganic,
} from '../../../components/OrganicCertifierSurvey/InterestedOrganic/PureInterestedOrganic';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../../history';
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

export default function OnboardingInterestedOrganic() {
  const survey = useSelector(certifierSurveySelector);
  const dispatch = useDispatch();

  const consentPath = '/consent';
  const onGoBack = () => {
    history.push(consentPath);
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
      history.push(certificationSelectionPath);
    } else {
      const callback = () => history.push(outroPath);
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
