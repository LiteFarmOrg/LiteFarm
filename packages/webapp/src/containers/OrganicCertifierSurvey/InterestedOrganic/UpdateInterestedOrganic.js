import React from 'react';
import { PureInterestedOrganic } from '../../../components/OrganicCertifierSurvey/InterestedOrganic/PureInterestedOrganic';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../../history';
import { certifierSurveySelector } from '../slice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

export default function UpdateInterestedOrganic() {
  const survey = useSelector(certifierSurveySelector);
  const dispatch = useDispatch();

  const goBackPath = '/certification';
  const onGoBack = () => {
    history.push(goBackPath);
  };
  const certificationSelectionPath = '/certification/selection';

  const onSubmit = (data) => {
    const interested = data.interested;
    if (data.interested) {
      history.push(certificationSelectionPath);
    } else {
      console.log({ data });
      // dispatch(postCertifiers({ survey: { interested } }));
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
