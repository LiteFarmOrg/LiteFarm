import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../history';
import PureOutroSplash from '../../components/Outro';
import { certifierSurveySelector } from '../OrganicCertifierSurvey/slice';
import { getCertifiers } from '../OrganicCertifierSurvey/saga';
import { patchOutroStep } from './saga';
import { loginSelector } from '../userFarmSlice';
import { startSpotLight } from '../ChooseFarm/chooseFarmFlowSlice';
import { isRequestingCertifierSelector } from '../OrganicCertifierSurvey/organicCertifierSurveySlice';

function Outro() {
  const userFarm = useSelector(loginSelector);
  const dispatch = useDispatch();
  const isRequesting = useSelector(isRequestingCertifierSelector);
  const onGoBack = () => {
    history.push(
      !survey.interested
        ? '/interested_in_organic'
        : isRequesting
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
