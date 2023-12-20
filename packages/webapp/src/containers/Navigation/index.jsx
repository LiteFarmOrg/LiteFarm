/*
 *  Copyright 2019-2022 LiteFarm.org
 *  This file is part of LiteFarm.
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

import { Suspense } from 'react';
import { connect } from 'react-redux';
import NoFarmNavBar from '../../components/Navigation/NoFarmNavBar';

import PureNavBar from '../../components/Navigation/NavBar';
import { userFarmLengthSelector } from '../userFarmSlice';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { setSpotlightToShown } from '../Map/saga';
import useIsFarmSelected from '../../hooks/useIsFarmSelected';
import ReleaseHandler from '../ReleaseHandler';

const NavBar = (props) => {
  const { history, dispatch, numberOfUserFarm, showedSpotlight } = props;
  const { navigation, notification } = showedSpotlight;
  const resetSpotlight = () => {
    dispatch(setSpotlightToShown(['notification', 'navigation']));
  };
  const isFarmSelected = useIsFarmSelected();

  return isFarmSelected ? (
    <Suspense fallback={<NoFarmNavBar />}>
      <PureNavBar
        showSpotLight={!navigation}
        showNotification={navigation && !notification}
        resetSpotlight={resetSpotlight}
        showSwitchFarm={numberOfUserFarm > 1}
        history={history}
      />
      <ReleaseHandler />
    </Suspense>
  ) : (
    <NoFarmNavBar history={history} />
  );
};

const mapStateToProps = (state) => {
  return {
    numberOfUserFarm: userFarmLengthSelector(state),
    showedSpotlight: showedSpotlightSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
