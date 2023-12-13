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
import PureNavBar from '../../components/Navigation/NavBar';
import { userFarmSelector, userFarmLengthSelector } from '../userFarmSlice';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { setSpotlightToShown } from '../Map/saga';
import useIsFarmSelected from '../../hooks/useIsFarmSelected';
import { CUSTOM_SIGN_UP } from '../CustomSignUp/constants';
import useHistoryLocation from '../hooks/useHistoryLocation';
import { useTranslation } from 'react-i18next';

const NavBar = ({ history }) => {
  const { t } = useTranslation(['translation']);
  const dispatch = useDispatch();
  const numberOfUserFarm = useSelector(userFarmLengthSelector);
  const { navigation, notification } = useSelector(showedSpotlightSelector);

  const { farm_name } = useSelector(userFarmSelector);
  const resetSpotlight = () => {
    dispatch(setSpotlightToShown(['notification', 'navigation']));
  };
  const isFarmSelected = useIsFarmSelected();
  const historyLocation = useHistoryLocation(history);
  const isCustomSignupPage = historyLocation.state?.component === CUSTOM_SIGN_UP;
  // Will use historyLocation in future PR
  const breadcrumbs = [
    { link: '/farm_selection', label: farm_name, section: 'FarmSelection' },
    { link: '/', label: t('HOME.HOME_BREADCRUMB'), section: 'Home' },
    { link: '/farm_selection', label: farm_name, section: 'FarmSelection' },
    { link: '/', label: t('HOME.HOME_BREADCRUMB'), section: 'Home' },
  ];

  return isFarmSelected ? (
    <PureNavBar
      showSpotLight={!navigation}
      showNotification={navigation && !notification}
      resetSpotlight={resetSpotlight}
      showSwitchFarm={numberOfUserFarm > 1}
      history={history}
      breadcrumbs={breadcrumbs}
    />
  ) : (
    <PureNavBar history={history} justLogo hidden={isCustomSignupPage} />
  );
};

export default NavBar;
