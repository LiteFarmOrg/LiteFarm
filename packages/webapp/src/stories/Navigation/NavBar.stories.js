import React from "react";
import { action } from '@storybook/addon-actions';
import { Provider } from "react-redux";
import {Router} from 'react-router-dom';
import history from './../../history';
import NavBar from "../../containers/Navigation";
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
          has_consent: true
        }}
    };
  },
  subscribe: () => 0,
  dispatch: action('dispatch'),
};

export default {
  title: 'Components/Navbar',
  decorators: [story =>
    <Provider store={store}>
      <Router history={history}>
        {story()}
      </Router>
    </Provider>],
  component: NavBar,
};

const Template = (args) => <NavBar {...args} />;

export const SignupNavbar = Template.bind({});

SignupNavbar.args = {
  auth: {logout: () => {}, isAuthenticated: () => false},
  history: {push: () => {}, location: {pathname: '/sign_up' }, replace: () => {}},
}

export const HomeNavbar = Template.bind({});

HomeNavbar.args = {
  auth: {logout: () => {}, isAuthenticated: () => true},
  history: {push: () => {}, location: {pathname: '/home' }, replace: () => {}},
}
