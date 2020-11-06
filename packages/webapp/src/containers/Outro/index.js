import React from 'react';
import { useSelector } from 'react-redux';
import history from '../../history';
import PureOutroSplash from '../../components/Outro';
import { certifierSurveySelector } from '../OrganicCertifierSurvey/selector';

function Outro() {
  const survey = useSelector(certifierSurveySelector);
  const onGoBack = () => {
    history.push(survey.interested ? '/organic_partners' : '/interested_in_organic');
  }
  const onContinue = () => {
    history.push('/');
  }

  return (
    <PureOutroSplash onGoBack={onGoBack} onContinue={onContinue}/>
  )

}

export default Outro;
