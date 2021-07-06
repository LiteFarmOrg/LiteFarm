import React from 'react';
import PureInterestedOrganic from '../../../components/InterestedOrganic';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { patchInterested, postCertifiers } from '../saga';
import history from '../../../history';
import { certifierSurveySelector } from '../slice';

export default function OnboardingInterestedOrganic() {
  const survey = useSelector(certifierSurveySelector, shallowEqual);
  const dispatch = useDispatch();

  const onSubmit = (data) => {
    const interested = data.interested;
    const callback = () =>
      interested ? history.push('/certification/selection') : history.push('/outro');
    if (survey.survey_id) {
      dispatch(patchInterested({ interested, callback }));
    } else {
      dispatch(postCertifiers({ survey: { interested }, callback }));
    }
  };
  const onGoBack = () => {
    history.push('/consent');
  };

  return (
    <>
      <PureInterestedOrganic
        onSubmit={onSubmit}
        onGoBack={onGoBack}
        defaultValues={{ interested: survey.interested }}
      />
    </>
  );
}
