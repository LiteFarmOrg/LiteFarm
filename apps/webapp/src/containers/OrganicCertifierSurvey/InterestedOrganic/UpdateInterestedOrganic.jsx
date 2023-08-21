import React from 'react';
import {
  PureInterestedOrganic,
} from '../../../components/OrganicCertifierSurvey/InterestedOrganic/PureInterestedOrganic';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../../history';
import { certifierSurveySelector } from '../slice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { getOrganicSurveyReqBody } from '../SetCertificationSummary/utils/getOrganicSurveyReqBody';
import { putOrganicCertifierSurvey } from '../saga';

export default function UpdateInterestedOrganic() {
  const survey = useSelector(certifierSurveySelector);
  const dispatch = useDispatch();

  const goBackPath = '/certification';
  const onGoBack = () => {
    history.push(goBackPath);
  };
  const certificationSelectionPath = '/certification/selection';

  const onSubmit = (data) => {
    if (data.interested) {
      history.push(certificationSelectionPath);
    } else {
      const reqBody = getOrganicSurveyReqBody({ interested: false, survey_id: survey.survey_id });
      const callback = () => history.push('/certification', { success: true });
      dispatch(putOrganicCertifierSurvey({ survey: reqBody, callback }));
    }
  };

  return (
    <HookFormPersistProvider>
      <PureInterestedOrganic
        onSubmit={onSubmit}
        onGoBack={onGoBack}
        persistedPathNames={[certificationSelectionPath]}
        survey={survey}
      />
    </HookFormPersistProvider>
  );
}
