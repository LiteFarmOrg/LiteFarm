import React from 'react';
import { action } from '@storybook/addon-actions';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import history from './../../history';
import PureNavigation from '../../components/Navigation';

const store = {
  getState: () => {
    return {
      entitiesReducer: {
        userFarmReducer: {
          farm_id: 'farm_id',
          user_id: 'user_id',
        },
        showedSpotlightReducer: {},
      },
    };
  },
  subscribe: () => 0,
  dispatch: action('dispatch'),
};

export default {
  title: 'Components/PureNavigation',
  component: PureNavigation,
};

export const SignupNavbar = ((args) => <PureNavigation {...args} justLogo />).bind({});
SignupNavbar.args = {
  history: {
    push: () => {},
    location: { pathname: '/home' },
    replace: () => {},
  },
};

const Template = (args) => <PureNavigation {...args} />;

export const HomeNavbar = Template.bind({});

HomeNavbar.args = {
  tooltipInteraction: { profile: false },
  auth: {
    logout: () => {},
    isAuthenticated: () => true,
  },
  history: {
    push: () => {},
    location: { pathname: '/home' },
    replace: () => {},
  },
};

export const HomeNavbarWithSpotlight = Template.bind({});

HomeNavbarWithSpotlight.args = {
  showSpotLight: true,
  resetSpotlight: () => {},
};

export const HomeNavbarWithTopMenu = Template.bind({});
HomeNavbarWithTopMenu.args = {
  resetSpotlight: () => {},
  defaultOpenMenu: true,
};
