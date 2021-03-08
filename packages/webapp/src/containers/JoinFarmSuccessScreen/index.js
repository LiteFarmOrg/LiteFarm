import React from 'react';
import PropTypes from 'prop-types';
import PureJoinFarmSuccessScreen from '../../components/JoinFarmSuccessScreen';
import { useDispatch, useSelector } from 'react-redux';
import { chooseFarmFlowSelector, endInvitationFlow } from '../ChooseFarm/chooseFarmFlowSlice';
import { deselectFarmSuccess, loginSelector } from '../userFarmSlice';

export default function JoinFarmSuccessScreen({ history }) {
  const dispatch = useDispatch();
  const { farm_id } = useSelector(loginSelector);
  const { showSpotLight, skipChooseFarm } = useSelector(chooseFarmFlowSelector);
  const { farm_name } = history.location.state || {};
  const onClick = () => {
    if (skipChooseFarm) {
      dispatch(endInvitationFlow(farm_id));
      history.push('/');
    } else {
      dispatch(endInvitationFlow(farm_id));
      dispatch(deselectFarmSuccess());
      history.push('/farm_selection', { farm_id });
    }
  };
  return (
    <PureJoinFarmSuccessScreen
      onClick={onClick}
      farm_name={farm_name}
      showSpotLight={showSpotLight}
    />
  );
}

JoinFarmSuccessScreen.prototype = {
  history: PropTypes.object,
};
