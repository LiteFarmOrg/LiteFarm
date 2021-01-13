import React from 'react';
import PropTypes from 'prop-types';
import PureJoinFarmSuccessScreen from '../../components/JoinFarmSuccessScreen';
import { useDispatch, useSelector } from 'react-redux';
import { leaveInvitationFlow } from '../InvitedUserCreateAccount/invitationSlice';
import { userFarmSelector } from '../userFarmSlice';
import { showSpotlight } from '../actions';

export default function JoinFarmSuccessScreen({ history }) {
  const dispatch = useDispatch();
  const onClick = () => {
    dispatch(leaveInvitationFlow());
    dispatch(showSpotlight(true));
    history.push('/');
  };
  const { farm_name } = useSelector(userFarmSelector);
  return <PureJoinFarmSuccessScreen onClick={onClick} farm_name={farm_name} />;
}

JoinFarmSuccessScreen.prototype = {
  history: PropTypes.object,
};
