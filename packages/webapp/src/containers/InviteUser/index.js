import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import history from '../../history';
import { showSpotlight } from '../actions';
import PureInviteUser from '../../components/InviteUser';
// import { certifierSurveySelector } from '../OrganicCertifierSurvey/slice';
import { getCertifiers } from '../OrganicCertifierSurvey/saga';
import { patchOutroStep } from './saga';

function InviteUser() {
  const dispatch = useDispatch();
  const onGoBack = () => {
    history.push('/Profile');
  };
  const onInvite = () => {
    console.log("i'm a miserable fool");
    // dispatch(inviteUser());
    // setTimeout(() => {
    //   dispatch(showSpotlight(true));
    // }, 200);
  };

  useEffect(() => {
    // if (!survey.survey_id) {
    // dispatch(getRoles());
    // }
  }, []);

  return <PureInviteUser onGoBack={onGoBack} onContinue={onInvite} />;
}

export default InviteUser;
