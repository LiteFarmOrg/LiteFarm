import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../history';
import { finishOnboarding } from './actions';
import { showSpotlight } from '../actions';
import PureOutroSplash from '../../components/Outro';
import { certifierSurveySelector } from '../OrganicCertifierSurvey/slice';
import { getCertifiers } from '../OrganicCertifierSurvey/saga';
import { patchOutroStep } from './saga';
import { userFarmSelector } from '../userFarmSlice';

function Outro() {
  const survey = useSelector(certifierSurveySelector);
  const { status } = useSelector(userFarmSelector);
  const dispatch = useDispatch();
  const onGoBack = () => {
    if(status === 'Invited') return history.push('consent');
    else history.push(survey.interested ? '/organic_partners' : '/interested_in_organic');
  }
  const onContinue = () => {
    dispatch(patchOutroStep({callback: ()=>history.push('/')}));
    setTimeout(() => {
      dispatch(showSpotlight(true));
    }, 200);

  }
  useEffect(() => {
    if (!survey.survey_id) {
      dispatch(getCertifiers());
    }},[]);

  return (
    <PureOutroSplash onGoBack={onGoBack} onContinue={onContinue}/>
  )

}


export default Outro;
