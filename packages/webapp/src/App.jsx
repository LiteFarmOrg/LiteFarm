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

import { Suspense, useState } from 'react';
import { matchPath } from 'react-router-dom';
import clsx from 'clsx';
import { SnackbarProvider } from 'notistack';

import Navigation from './containers/Navigation';
import history from './history';
import { NotistackSnackbar } from './containers/Snackbar/NotistackSnackbar';
import { OfflineDetector } from './containers/hooks/useOfflineDetector/OfflineDetector';
import styles from './styles.module.scss';
import Routes from './routes';
import { ANIMALS_INVENTORY_URL, ANIMALS_URL } from './util/siteMapConstants';

function App() {
  const [isCompactSideMenu, setIsCompactSideMenu] = useState(false);
  const FULL_WIDTH_ROUTES = ['/map', ANIMALS_INVENTORY_URL, ANIMALS_URL];
  const isFullWidth = FULL_WIDTH_ROUTES.some((path) => matchPath(history.location.pathname, path));

  return (
    <div className={clsx(styles.container)}>
      <Suspense fallback={null}>
        <Navigation
          history={history}
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
                root: clsx(styles.root, isCompactSideMenu ? styles.isCompact : styles.isExpanded),
                containerRoot: styles[`containerRoot${isCompactSideMenu ? 'WithCompactMenu' : ''}`],
              }}
              // https://notistack.com/features/customization#custom-component
              Components={{ common: NotistackSnackbar }}
            >
              <Routes isCompactSideMenu={isCompactSideMenu} />
            </SnackbarProvider>
          </div>
        </Navigation>
      </Suspense>
    </div>
  );
}

export default App;
