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
import { useDispatch, useSelector } from 'react-redux';
import NoFarmNavBar from '../../components/Navigation/NoFarmNavBar';

import PureNavBar from '../../components/Navigation/NavBar';
import { userFarmLengthSelector } from '../userFarmSlice';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { setSpotlightToShown } from '../Map/saga';
import useIsFarmSelected from '../../hooks/useIsFarmSelected';

const NavBar = ({ history }) => {
  const dispatch = useDispatch();
  const numberOfUserFarm = useSelector(userFarmLengthSelector);
  const showedSpotlight = useSelector(showedSpotlightSelector);
  const { navigation, notification } = showedSpotlight;
  const isFarmSelected = useIsFarmSelected();

  const resetSpotlight = () => {
    dispatch(setSpotlightToShown(['notification', 'navigation']));
  };

  return isFarmSelected ? (
    <Suspense fallback={<NoFarmNavBar />}>
      <PureNavBar
        showSpotLight={!navigation}
        showNotification={navigation && !notification}
        resetSpotlight={resetSpotlight}
        showSwitchFarm={numberOfUserFarm > 1}
        history={history}
      />
    </Suspense>
  ) : (
    <NoFarmNavBar history={history} />
  );
};

export default NavBar;
