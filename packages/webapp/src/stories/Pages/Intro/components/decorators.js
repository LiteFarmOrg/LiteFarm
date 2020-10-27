import React from 'react';
import Layout from './Layout';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import history from '../../../../history';
import { action } from '@storybook/addon-actions';
import Navbar from '../../../Navigation';

const store = {
  getState: () => {
    return {
      baseReducer: {
        users: {
          first_name: 'Fake',
          last_name: 'User',
          email: 'email@test.com',
          user_id: '221242323',
        }, farm: {
          has_consent: true,
        },
      },
    };
  },
  subscribe: () => 0,
  dispatch: action('dispatch'),
};

const auth = {
  logout: () => {
  }, isAuthenticated: () => false,
};



export default [story =>
    <Provider store={store}>
      <Router history={history}>
        <div style={{width:'100%', maxWidth: '1024px'}}>
          <Navbar history={history} auth={auth}/>
            {story()}
        </div>
      </Router>
    </Provider>];
