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
import { useLocation, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Snackbar, Slide } from '@mui/material';
import PureNavigation from '../../components/Navigation';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { setSpotlightToShown } from '../Map/saga';
import useIsFarmSelected from '../../hooks/useIsFarmSelected';
import { CUSTOM_SIGN_UP } from '../CustomSignUp/constants';
import ReleaseBadgeHandler from '../ReleaseBadgeHandler';
import { matchPath } from 'react-router-dom';
import { useIsOffline } from '../hooks/useOfflineDetector/useIsOffline';

function TransitionDown(props) {
  return <Slide {...props} direction="down" />;
}

const Navigation = ({ children, ...props }) => {
  const offline = useIsOffline();
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const isFarmSelected = useIsFarmSelected();
  const ACCEPTING_INVITE_URLS = ['/accept_invitation/sign_up', '/accept_invitation/create_account'];
  const isAcceptingInvite = ACCEPTING_INVITE_URLS.some((path) =>
    matchPath(location.pathname, path),
  );
  const isLoginPage = location.state?.component === CUSTOM_SIGN_UP;
  // Hides the top navigation bar with logo on the login component
  const showNav = !isLoginPage;
  // Shows the navigation links when farm is selected and not accepting an farm invitation
  const showNavActions = isFarmSelected && !isAcceptingInvite;
  const { navigation, notification } = useSelector(showedSpotlightSelector);
  const resetSpotlight = () => {
    dispatch(setSpotlightToShown(['notification', 'navigation']));
  };

  return (
    <>
      <Snackbar
        open={offline}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={TransitionDown}
        sx={{
          top: '0 !important',
          left: '0 !important',
          right: '0 !important',
          transform: 'none !important',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '32px',
            padding: '8px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--Colors-Primary-Primary-teal-100)',
            color: 'var(--Colors-Primary-Primary-teal-700)',
            boxSizing: 'border-box',
          }}
        >
          {t('NAVIGATION.OFFLINE_TEXT_FULL')}
        </div>
      </Snackbar>
      <PureNavigation
        showNavigationSpotlight={!navigation}
        showNotificationSpotlight={navigation && !notification}
        resetSpotlight={resetSpotlight}
        history={history}
        showNavActions={showNavActions}
        showNav={showNav}
        {...props}
      >
        {children}
      </PureNavigation>
      {isFarmSelected && <ReleaseBadgeHandler {...props} />}
    </>
  );
};

export default Navigation;
