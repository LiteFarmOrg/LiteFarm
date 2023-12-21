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

import { useSelector, useDispatch } from 'react-redux';
import PureNavigation from '../../components/Navigation';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { setSpotlightToShown } from '../Map/saga';
import useIsFarmSelected from '../../hooks/useIsFarmSelected';
import { CUSTOM_SIGN_UP } from '../CustomSignUp/constants';
import useHistoryLocation from '../hooks/useHistoryLocation';

const Navigation = ({ history, children }) => {
  const dispatch = useDispatch();
  const historyLocation = useHistoryLocation(history);
  const isCustomSignupPage = historyLocation.state?.component === CUSTOM_SIGN_UP;
  const isFarmSelected = useIsFarmSelected();
  const { navigation, notification } = useSelector(showedSpotlightSelector);
  const resetSpotlight = () => {
    dispatch(setSpotlightToShown(['notification', 'navigation']));
  };

  return (
    <PureNavigation
      showNavigationSpotlight={!navigation}
      showNotificationSpotlight={navigation && !notification}
      resetSpotlight={resetSpotlight}
      history={history}
      isFarmSelected={isFarmSelected}
      hidden={isCustomSignupPage}
    >
      {children}
    </PureNavigation>
  );
};

export default Navigation;
