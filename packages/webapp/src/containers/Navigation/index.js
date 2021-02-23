/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (index.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import React, { Suspense, useState } from 'react';
import { connect } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import SmallerLogo from '../../assets/images/smaller_logo.svg';
import SmallLogo from '../../assets/images/small_logo.svg';
import NoFarmNavBar from '../../components/Navigation/NoFarmNavBar';

import { chooseFarmFlowSelector, endSpotLight } from '../ChooseFarm/chooseFarmFlowSlice';
import PureNavBar from '../../components/Navigation/NavBar';
import { userFarmLengthSelector, userFarmSelector } from '../userFarmSlice';
import { isAuthenticated } from '../../util/jwt';

const NavBar = (props) => {
  const { history, farm, farmState, dispatch, numberOfUserFarm } = props;
  const { showSpotLight, isInvitationFlow } = farmState;
  const isFarmSelected =
    isAuthenticated() && farm && farm.has_consent && farm?.step_five === true && !isInvitationFlow;
  const resetSpotlight = () => {
    dispatch(endSpotLight(farm.farm_id));
  };

  const initialState = { profile: false, myFarm: false, notification: false };
  const [tooltipInteraction, setTooltipInteraction] = useState(initialState);
  const [isOneTooltipOpen, setOneTooltipOpen] = useState(false);
  const changeInteraction = (tooltipName, onOverlay = false) => {
    const newInteraction = onOverlay
      ? initialState
      : {
          ...initialState,
          [tooltipName]: !tooltipInteraction[tooltipName],
        };
    setTooltipInteraction(newInteraction);
    setOneTooltipOpen(Object.keys(newInteraction).some((k) => newInteraction[k]));
  };

  return isFarmSelected ? (
    <Suspense fallback={<NoFarmNavBar />}>
      <PureNavBar
        logo={<Logo history={history} />}
        showSpotLight={showSpotLight}
        resetSpotlight={resetSpotlight}
        isOneTooltipOpen={isOneTooltipOpen}
        changeInteraction={changeInteraction}
        showSwitchFarm={numberOfUserFarm > 1}
        tooltipInteraction={tooltipInteraction}
        history={history}
      >
        {/*<SlideMenu right />*/}
      </PureNavBar>
    </Suspense>
  ) : (
    <NoFarmNavBar history={history} />
  );
};

const Logo = ({ history }) => {
  const isSmallScreen = useMediaQuery({ query: '(max-width: 800px)' });
  return isSmallScreen ? (
    <img src={SmallerLogo} alt="Logo" onClick={() => history.push('/')} />
  ) : (
    <img src={SmallLogo} alt="Logo" onClick={() => history.push('/')} />
  );
};

const mapStateToProps = (state) => {
  return {
    farm: userFarmSelector(state),
    farmState: chooseFarmFlowSelector(state),
    numberOfUserFarm: userFarmLengthSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
