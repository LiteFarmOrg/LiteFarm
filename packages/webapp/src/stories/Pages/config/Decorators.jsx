import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import history from '../../../history';
import { action } from '@storybook/addon-actions';
import state from './state';
import NavBar from '../../../containers/Navigation';
import theme from '../../../assets/theme';
import { CssBaseline, ThemeProvider } from '@material-ui/core';

const store = {
  getState: () => {
    return state;
  },
  subscribe: () => 0,
  dispatch: action('dispatch'),
};

const auth = (isAuthenticated = false) => ({
  logout: () => {},
  isAuthenticated: () => isAuthenticated,
});


const setIdToken = () => {
  if (!localStorage.getItem('id_token')) {
    localStorage.setItem('id_token', 'id_token');
  }
};

export default [
  (story) => {
    setIdToken();
    return <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router history={history}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: '100vh',
            }}
            >
              <NavBar history={history} auth={auth()} />
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
                {story()}
              </div>
            </div>
          </Router>
        </ThemeProvider>
      </Provider>
  },
];

export const authenticatedDecorators = [
  (story) => {
    setIdToken();
    return <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router history={history}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: '100vh',
            }}
            >
              <NavBar history={history} auth={auth(true)} />
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
                {story()}
              </div>
            </div>
          </Router>
        </ThemeProvider>
      </Provider>
  },
];

export const decoratorsWithStore = [
  (story) => {

    return <Provider store={store}>
      <ThemeProvider theme={theme}>
        <>
          <CssBaseline />
          <Router history={history}>
            <div style={{ padding: '24px' }}>{story()}</div>
          </Router>
        </>
      </ThemeProvider>
    </Provider>;
  },
];

export const themeWrapper = (story) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {story()}
  </ThemeProvider>
);

export const componentDecorators = [
  (story) => {
    return <div style={{ padding: '24px' }}>{story()}</div>;
  },
  themeWrapper,
];

export const componentDecoratorsGreyBackground = [
  (story) => {
    return <div style={{ padding: '24px', backgroundColor: 'gray' }}>{story()}</div>;
  },
  themeWrapper,
];

export const componentDecoratorsWithoutPadding = [
  (story) => {
    return story();
  },
  themeWrapper,
];
