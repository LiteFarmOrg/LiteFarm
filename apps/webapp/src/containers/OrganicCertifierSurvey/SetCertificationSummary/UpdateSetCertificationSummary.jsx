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
import { putOrganicCertifierSurvey } from '../saga';

export default function UpdateSetCertificationSummary({ history }) {
  const persistedFormData = useSelector(hookFormPersistSelector);
  const requestCertifierPath = '/certification/certifier/request';
  const selectCertifierPath = '/certification/certifier/selection';
  const dispatch = useDispatch();
  const onSubmit = () => {
    const data = getOrganicSurveyReqBody(persistedFormData);
    const callback = () => history.push('/certification', { success: true });
    dispatch(putOrganicCertifierSurvey({ survey: data, callback }));
  };
  const { certifierName, isRequestedCertifier } = useCertifierName();
  const { certificationName } = useCertificationName();
  const certifiers = useCertifiers();
  const onGoBack = () => {
    isRequestedCertifier || certifiers.length < 1
      ? history.push(requestCertifierPath)
      : history.push(selectCertifierPath);
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
