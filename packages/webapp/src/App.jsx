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

import { useEffect, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { SnackbarProvider } from 'notistack';

import Navigation from './containers/Navigation';
import { NotistackSnackbar } from './containers/Snackbar/NotistackSnackbar';
import styles from './styles.module.scss';
import Routes from './routes';
import { ANIMALS_URL, MAP_URL, SENSORS_URL } from './util/siteMapConstants';
import { AppUIContext } from './contexts/appContext';
import { useOfflineDetector } from './containers/hooks/useOfflineDetector/useOfflineDetector';
import { useServiceWorkerListener } from './hooks/useServiceWorkerListener/useServiceWorkerListener';
import { useGoogleMapsLoader } from './hooks/useGoogleMapsLoader';
import useOfflineActivityLogger from './hooks/useOfflineActivityLogger';

function App() {
  const location = useLocation();
  // TEMP welcome-trace: render-body log. Fires on every render of App with the current
  // router location. Pairs with the mount/unmount log below to prove Suspense boundary A
  // (main.jsx: <Suspense fallback={null}> wrapping <App/>) never tears App down.
  console.log('[welcome-trace] App RENDER', { routerLocation: location.pathname }); // TEMP welcome-trace
  const [isCompactSideMenu, setIsCompactSideMenu] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState(null);
  const FULL_WIDTH_ROUTES = [MAP_URL, ANIMALS_URL, SENSORS_URL];
  const isFullWidth = FULL_WIDTH_ROUTES.some((path) => matchPath(location.pathname, path));

  useOfflineDetector();
  useServiceWorkerListener();
  useOfflineActivityLogger();
  const { isLoaded } = useGoogleMapsLoader();

  // TEMP welcome-trace: mount/unmount probe. If Suspense boundary A (above <App/> in
  // main.jsx) ever caught a suspension from the side menu / Navigation, App would UNMOUNT
  // and later REMOUNT. Seeing exactly one MOUNTED and no UNMOUNTED through the SSO ->
  // /welcome repro proves boundary A never fired -> App's Suspense is not in the chain.
  useEffect(() => {
    console.log('[welcome-trace] App MOUNTED (boundary A did NOT tear App down)'); // TEMP welcome-trace
    return () => {
      console.log('[welcome-trace] App UNMOUNTED (boundary A caught -> App torn down)'); // TEMP welcome-trace
    };
  }, []);

  return (
    <div className={clsx(styles.container)}>
      <AppUIContext.Provider
        value={{
          activeDrawer,
          setActiveDrawer,
          maps: { isLoaded },
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
      </AppUIContext.Provider>
    </div>
  );
}

export default App;
