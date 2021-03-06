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

import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import NoFarmNavBar from '../../components/Navigation/NoFarmNavBar';

import { chooseFarmFlowSelector, endSpotLight } from '../ChooseFarm/chooseFarmFlowSlice';
import PureNavBar from '../../components/Navigation/NavBar';
import { isAdminSelector, userFarmLengthSelector, userFarmSelector } from '../userFarmSlice';
import { isAuthenticated } from '../../util/jwt';
import { setDefaultDateRange } from '../Log/actions';

const NavBar = (props) => {
  const { history, farm, farmState, dispatch, numberOfUserFarm, isAdmin } = props;
  const { showSpotLight, isInvitationFlow } = farmState;
  const isFarmSelected =
    isAuthenticated() && farm && farm.has_consent && farm?.step_five === true && !isInvitationFlow;
  const resetSpotlight = () => {
    dispatch(endSpotLight(farm.farm_id));
  };

  return isFarmSelected ? (
    <Suspense fallback={<NoFarmNavBar />}>
      <PureNavBar
        showSpotLight={showSpotLight}
        resetSpotlight={resetSpotlight}
        showSwitchFarm={numberOfUserFarm > 1}
        history={history}
        setDefaultDateRange={() => dispatch(setDefaultDateRange())}
        showFinances={isAdmin}
      />
    </Suspense>
  ) : (
    <NoFarmNavBar history={history} />
  );
};

const mapStateToProps = (state) => {
  return {
    farm: userFarmSelector(state),
    farmState: chooseFarmFlowSelector(state),
    numberOfUserFarm: userFarmLengthSelector(state),
    isAdmin: isAdminSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
