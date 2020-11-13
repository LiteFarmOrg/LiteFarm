import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import history from '../../history';
import { finishOnboarding } from './actions';
import { showSpotlight } from "../actions";
import PureOutroSplash from "../../components/Outro";
import { certifierSurveySelector } from '../OrganicCertifierSurvey/selector';

function Outro() {
  const survey = useSelector(certifierSurveySelector);
  const dispatch = useDispatch();
  const onGoBack = () => {
    history.push(survey.interested ? '/organic_partners' : '/interested_in_organic');
  }

  const onContinue = () => {
    dispatch(finishOnboarding(() =>{
      history.push('/');
      setTimeout(() => {
        dispatch(showSpotlight(true));
      }, 200)
      
    }
    ));
  }

  return (
    <PureOutroSplash onGoBack={onGoBack} onContinue={onContinue}/>
  )

}


export default Outro;
