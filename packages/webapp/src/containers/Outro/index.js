import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../history';
import PureOutroSplash from '../../components/Outro';
import { certifierSurveySelector } from '../OrganicCertifierSurvey/slice';
import { patchOutroStep } from './saga';
import {
  finishedSelectingCertificationTypeSelector,
  requestedCertifierSelector,
} from '../OrganicCertifierSurvey/organicCertifierSurveySlice';

function Outro() {
  const dispatch = useDispatch();
  const requestCertifierData = useSelector(requestedCertifierSelector);
  const survey = useSelector(certifierSurveySelector);
  const selected = useSelector(finishedSelectingCertificationTypeSelector);
  const onGoBack = () => {
    history.push(
      !survey.interested || !selected
        ? '/interested_in_organic'
        : requestCertifierData
        ? '/requested_certifier'
        : '/certifier_selection_menu',
    );
  };
  const onContinue = () => {
    dispatch(patchOutroStep());
  };

  return <PureOutroSplash onGoBack={onGoBack} onContinue={onContinue} />;
}

export default Outro;
