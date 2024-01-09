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
import {
  CREATE_USER_ACCOUNT,
  CUSTOM_SIGN_UP,
  ENTER_PASSWORD_PAGE,
} from '../CustomSignUp/constants';
import ReleaseBadgeHandler from '../ReleaseBadgeHandler';

const Navigation = ({ history, children, ...props }) => {
  const dispatch = useDispatch();
  const isFarmSelected = useIsFarmSelected();
  const { navigation, notification } = useSelector(showedSpotlightSelector);
  const resetSpotlight = () => {
    dispatch(setSpotlightToShown(['notification', 'navigation']));
  };
  const hideNavBar = [CUSTOM_SIGN_UP, ENTER_PASSWORD_PAGE, CREATE_USER_ACCOUNT].includes(
    history.location?.state?.component,
  );

  return (
    <>
      <PureNavigation
        showNavigationSpotlight={!navigation}
        showNotificationSpotlight={navigation && !notification}
        resetSpotlight={resetSpotlight}
        history={history}
        isFarmSelected={isFarmSelected}
        hidden={hideNavBar}
        {...props}
      >
        {children}
      </PureNavigation>
      {isFarmSelected && <ReleaseBadgeHandler {...props} />}
    </>
  );
};

export default Navigation;
