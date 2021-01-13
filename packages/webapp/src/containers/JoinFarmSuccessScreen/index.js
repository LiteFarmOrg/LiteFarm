import React from 'react';
import PropTypes from 'prop-types';
import PureJoinFarmSuccessScreen from '../../components/JoinFarmSuccessScreen';
import { useDispatch } from 'react-redux';
import { showSpotlight } from '../actions';

export default function JoinFarmSuccessScreen({ history }) {
  const dispatch = useDispatch();
  const { showSpotLight, farm_name, farm_id } = history.location.state || {};
  const onClick = () => {
    showSpotLight && dispatch(showSpotlight(true));
    history.push('/farm_selection', { farm_id });
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
