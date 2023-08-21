import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../history';
import PureOutroSplash from '../../components/Outro';
import { certifierSurveySelector } from '../OrganicCertifierSurvey/slice';
import { patchOutroStep } from './saga';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { useCertifierName } from '../OrganicCertifierSurvey/useCertifierName';

function Outro() {
  const dispatch = useDispatch();
  const survey = useSelector(certifierSurveySelector);
  const { isRequestedCertifier } = useCertifierName();
  const { navigation } = useSelector(showedSpotlightSelector);
  const toShowSpotlight = !navigation;
  const onGoBack = () => {
    history.push(
      !survey.interested
        ? '/certification/interested_in_organic'
        : isRequestedCertifier
        ? '/certification/certifier/request'
        : '/certification/certifier/selection',
    );
  };
  const onContinue = () => {
    dispatch(patchOutroStep());
  };

  return (
    <PureOutroSplash
      onGoBack={onGoBack}
      onContinue={onContinue}
      toShowSpotlight={toShowSpotlight}
    />
  );
}

export default Outro;
