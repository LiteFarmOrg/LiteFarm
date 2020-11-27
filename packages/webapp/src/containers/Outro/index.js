import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../history';
import { showSpotlight } from '../actions';
import PureOutroSplash from '../../components/Outro';
import { certifierSurveySelector } from '../OrganicCertifierSurvey/slice';
import { getCertifiers } from '../OrganicCertifierSurvey/saga';
import { patchOutroStep } from './saga';

function Outro() {
  const dispatch = useDispatch();
  const onGoBack = () => {
    history.push(survey.interested ? '/organic_partners' : '/interested_in_organic');
  }
  const onContinue = () => {
    dispatch(patchOutroStep({callback: ()=>history.push('/')}));
    setTimeout(() => {
      dispatch(showSpotlight(true));
    }, 200);

  }
  const survey = useSelector(certifierSurveySelector);
  useEffect(() => {
    if (!survey.survey_id) {
      dispatch(getCertifiers());
    }},[survey, dispatch]);

  return (
    <PureOutroSplash onGoBack={onGoBack} onContinue={onContinue}/>
  )

}


export default Outro;
