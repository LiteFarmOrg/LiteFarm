import React from 'react';
import {
  PureSetCertificationSummary,
} from '../../../components/OrganicCertifierSurvey/SetCertificationSummary/PureSetCertificationSummary';
import { useDispatch, useSelector } from 'react-redux';
import { useCertificationName } from '../useCertificationName';
import { useCertifiers } from '../useCertifiers';
import { useCertifierName } from '../useCertifierName';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getOrganicSurveyReqBody } from './utils/getOrganicSurveyReqBody';
import { postOrganicCertifierSurvey, putOrganicCertifierSurvey } from '../saga';
import { certifierSurveySelector } from '../slice';

export default function OnboardingSetCertificationSummary({ history }) {
  const survey = useSelector(certifierSurveySelector);
  const persistedFormData = useSelector(hookFormPersistSelector);
  const requestCertifierPath = '/certification/certifier/request';
  const selectCertifierPath = '/certification/certifier/selection';
  const outroPath = '/outro';
  const dispatch = useDispatch();
  const onSubmit = () => {
    const callback = () => history.push('/outro', { success: true });
    if (survey.survey_id) {
      dispatch(
        putOrganicCertifierSurvey({
          survey: getOrganicSurveyReqBody({ ...survey, ...persistedFormData }),
          callback,
        }),
      );
    } else {
      dispatch(
        postOrganicCertifierSurvey({
          survey: getOrganicSurveyReqBody(persistedFormData),
          callback,
        }),
      );
    }
  };
  const { certifierName, isRequestedCertifier } = useCertifierName();
  const { certificationName } = useCertificationName();
  const certifiers = useCertifiers();
  const onGoBack = () => {
    isRequestedCertifier || certifiers.length < 1
      ? history.push(requestCertifierPath)
      : history.push(selectCertifierPath);
  };

  useHookFormPersist(() => ({}), [requestCertifierPath, selectCertifierPath, outroPath]);
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
