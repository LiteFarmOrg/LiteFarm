/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (App.js) is part of LiteFarm.
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

import { useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { SnackbarProvider } from 'notistack';

import Navigation from './containers/Navigation';
import { NotistackSnackbar } from './containers/Snackbar/NotistackSnackbar';
import styles from './styles.module.scss';
import Routes from './routes';
import { ANIMALS_URL, MAP_URL, SENSORS_URL } from './util/siteMapConstants';
import { NavMenuControlsContext } from './contexts/appContext';
import { useOfflineDetector } from './containers/hooks/useOfflineDetector/useOfflineDetector';
import { useServiceWorkerListener } from './hooks/useServiceWorkerListener/useServiceWorkerListener';
import { useGoogleMapsLoader } from './hooks/useGoogleMapsLoader';
import GoogleMapsPreWarmer from './components/GoogleMapsPreWarmer';

function App() {
  const location = useLocation();
  const [isCompactSideMenu, setIsCompactSideMenu] = useState(false);
  const [isFeedbackSurveyOpen, setFeedbackSurveyOpen] = useState(false);
  const FULL_WIDTH_ROUTES = [MAP_URL, ANIMALS_URL, SENSORS_URL];
  const isFullWidth = FULL_WIDTH_ROUTES.some((path) => matchPath(location.pathname, path));

  useOfflineDetector();
  useServiceWorkerListener();
  const { isLoaded } = useGoogleMapsLoader();

  return (
    <div className={clsx(styles.container)}>
      {/* Hidden component to pre-warm Google Maps cache by triggering lazy-loaded modules */}
      <GoogleMapsPreWarmer isLoaded={isLoaded} />

      <NavMenuControlsContext.Provider
        value={{
          feedback: { isFeedbackSurveyOpen, setFeedbackSurveyOpen },
        }}
      >
        <Navigation
          isCompactSideMenu={isCompactSideMenu}
          setIsCompactSideMenu={setIsCompactSideMenu}
        >
          <div className={clsx(styles.app, isFullWidth && styles.fullWidthApp)}>
            <SnackbarProvider
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              classes={{
                root: clsx(styles.root, isCompactSideMenu && styles.compactRoot),
                containerRoot: clsx(
                  styles.containerRoot,
                  isCompactSideMenu && styles.compactContainerRoot,
                ),
              }}
              // https://notistack.com/features/customization#custom-component
              Components={{ common: NotistackSnackbar }}
            >
              <Routes isCompactSideMenu={isCompactSideMenu} />
            </SnackbarProvider>
          </div>
        </Navigation>
      </NavMenuControlsContext.Provider>
    </div>
  );
}

export default App;
