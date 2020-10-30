import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import history from '../../../history';
import { action } from '@storybook/addon-actions';
import state from './state';
import NavBar from "../../../containers/Navigation";

const store = {
  getState: () => {
    return state;
  },
  subscribe: () => 0,
  dispatch: action('dispatch'),
};

const auth = (isAuthenticated = false) => ({
  logout: () => {
  }, isAuthenticated: () => isAuthenticated,
});



export default [story =>
    <Provider store={store}>
      <Router history={history}>
        <div style={{width:'100%', maxWidth: '1024px'}}>
          <NavBar history={history} auth={auth()}/>
            {story()}
        </div>
      </Router>
    </Provider>];

export const authenticatedDecorators = [story =>
  <Provider store={store}>
    <Router history={history}>
      <div style={{width:'100%', maxWidth: '1024px'}}>
        <NavBar history={history} auth={auth(true)}/>
        {story()}
      </div>
    </Router>
  </Provider>];
