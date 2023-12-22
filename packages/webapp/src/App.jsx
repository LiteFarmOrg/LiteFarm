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

import { Suspense } from 'react';
import Navigation from './containers/Navigation';
import history from './history';
import clsx from 'clsx';
import { SnackbarProvider } from 'notistack';
import { NotistackSnackbar } from './containers/Snackbar/NotistackSnackbar';
import { OfflineDetector } from './containers/hooks/useOfflineDetector/OfflineDetector';
import styles from './styles.module.scss';
import Routes from './routes';

function App() {
  return (
    <div className={clsx(styles.container)}>
      <Suspense fallback={null}>
        <Navigation history={history}>
          <div className={styles.app}>
            <OfflineDetector />
            <SnackbarProvider
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              classes={{ root: styles.root, containerRoot: styles.root }}
              content={(key, message) => <NotistackSnackbar id={key} message={message} />}
            >
              <Routes />
            </SnackbarProvider>
          </div>
        </Navigation>
      </Suspense>
    </div>
  );
}

export default App;
