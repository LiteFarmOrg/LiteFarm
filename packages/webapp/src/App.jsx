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

import React from 'react';
import NavBar from './containers/Navigation';
import history from './history';
import Routes from './Routes.jsx';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { SnackbarProvider } from 'notistack';
import { NotistackSnackbar } from './containers/Snackbar/NotistackSnackbar';
import { OfflineDetector } from './containers/hooks/useOfflineDetector/OfflineDetector';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100vw',
    flexGrow: 1,
  },
  defaultHeight: {
    minHeight: '100vh',
  },
  webkitHeight: {
    minHeight: '-webkit-fill-available',
  },
  root: {
    width: 'calc(100vw - 48px)',
    maxWidth: '976px',
  },
}));

function App() {
  const classes = useStyles();
  return (
    <>
      <div className={clsx(classes.container, classes.defaultHeight, classes.webkitHeight)}>
        <NavBar history={history} />
        <div
          className="app"
          style={{
            width: '100%',
            maxWidth: '1024px',
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <OfflineDetector />
          <SnackbarProvider
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            classes={{ root: classes.root, containerRoot: classes.root }}
            content={(key, message) => <NotistackSnackbar id={key} message={message} />}
          >
            <Routes />
          </SnackbarProvider>
        </div>
      </div>
    </>
  );
}

export default App;
