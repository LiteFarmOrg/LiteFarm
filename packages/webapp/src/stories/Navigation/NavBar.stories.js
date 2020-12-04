import React from 'react';
import { action } from '@storybook/addon-actions';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import history from './../../history';
import NavBar from '../../components/Navigation/NavBar';
import NoFarmNavBar from '../../components/Navigation/NoFarmNavBar';

const store = {
  getState: () => {
    return {
      baseReducer: {
        users: {
          first_name: 'Fake',
          last_name: 'User',
          email: 'email@test.com',
          user_id: '221242323',
        },
        farm: {
          has_consent: true,
        },
      },
    };
  },
  subscribe: () => 0,
  dispatch: action('dispatch'),
};

export default {
  title: 'Components/Navbar',
  decorators: [
    (story) => (
      <Provider store={store}>
        <Router history={history}>{story()}</Router>
      </Provider>
    ),
  ],
  component: NavBar,
};

const Template = (args) => <NavBar {...args} />;

export const SignupNavbar = (() => <NoFarmNavBar />).bind({});

export const HomeNavbar = Template.bind({});

HomeNavbar.args = {
  tooltipInteraction: { profile: false },
  auth: { logout: () => {}, isAuthenticated: () => true },
  history: {
    push: () => {},
    location: { pathname: '/home' },
    replace: () => {},
  },
};
