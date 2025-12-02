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

import { createContext, Suspense, useContext, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { SnackbarProvider } from 'notistack';

import Navigation from './containers/Navigation';
import { NotistackSnackbar } from './containers/Snackbar/NotistackSnackbar';
import { OfflineDetector } from './containers/hooks/useOfflineDetector/OfflineDetector';
import styles from './styles.module.scss';
import Routes from './routes';
import { ANIMALS_URL, MAP_URL, SENSORS_URL } from './util/siteMapConstants';

/**
 * @typedef {Object} NavMenuControlsContextValue
 * @property {Object} feedback
 * @property {boolean} feedback.isFeedbackSurveyOpen        - Whether the feedback survey modal is open
 * @property {React.Dispatch<React.SetStateAction<boolean>>} feedback.setFeedbackSurveyOpen - Setter for the feedback survey modal
 */

/**
 * Context for controlling navigation menu related UI states (e.g. feedback survey modal)
 *
 * @type {React.Context<NavMenuControlsContextValue | null>}
 */
export const NavMenuControlsContext = createContext(null);

export const useNavMenuControls = () => {
  const NavMenuControls = useContext(NavMenuControlsContext);
  if (!NavMenuControls) {
    throw new Error('NavMenuControlsContext must be used within a provider');
  } else {
    return NavMenuControls;
  }
};

function App() {
  const location = useLocation();
  const [isCompactSideMenu, setIsCompactSideMenu] = useState(false);
  const [isFeedbackSurveyOpen, setFeedbackSurveyOpen] = useState(false);
  const FULL_WIDTH_ROUTES = [MAP_URL, ANIMALS_URL, SENSORS_URL];
  const isFullWidth = FULL_WIDTH_ROUTES.some((path) => matchPath(location.pathname, path));

  return (
    <div className={clsx(styles.container)}>
      <Suspense fallback={null}>
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
              <OfflineDetector />
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
      </Suspense>
    </div>
  );
}

export default App;
