import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../history';
import PureOutroSplash from '../../components/Outro';
import { certifierSurveySelector } from '../OrganicCertifierSurvey/slice';
import { getCertifiers } from '../OrganicCertifierSurvey/saga';
import { patchOutroStep } from './saga';
import { requestedCertifierSelector } from '../OrganicCertifierSurvey/organicCertifierSurveySlice';

function Outro() {
  const dispatch = useDispatch();
  const requestCertifierData = useSelector(requestedCertifierSelector);
  const onGoBack = () => {
    history.push(
      !survey.interested
        ? '/interested_in_organic'
        : requestCertifierData
        ? '/requested_certifier'
        : '/certifier_selection_menu',
    );
  };
  const onContinue = () => {
    dispatch(patchOutroStep());
  };
  const survey = useSelector(certifierSurveySelector);
  useEffect(() => {
    if (!survey.survey_id) {
      dispatch(getCertifiers());
    }
  }, []);

  return <PureOutroSplash onGoBack={onGoBack} onContinue={onContinue} />;
}

export default Outro;
