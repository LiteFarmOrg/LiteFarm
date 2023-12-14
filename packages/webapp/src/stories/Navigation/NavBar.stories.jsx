import React from 'react';
import { action } from '@storybook/addon-actions';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import history from './../../history';
import NavBar from '../../components/Navigation/NavBar';

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
  title: 'Components/Navbar',
  component: NavBar,
};

export const SignupNavbar = ((args) => <NavBar {...args} justLogo />).bind({});
SignupNavbar.args = {
  history: {
    push: () => {},
    location: { pathname: '/home' },
    replace: () => {},
  },
};

const Template = (args) => <NavBar {...args} />;

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

export const HomeNavbarWithBreadcrumbs = Template.bind({});

HomeNavbarWithBreadcrumbs.args = {
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
  breadcrumbs: [
    { link: '/farm_selection', label: 'Jolly Farm', section: 'FarmSelection' },
    { link: '/', label: 'Home', section: 'Home' },
    { link: '/farm_selection', label: 'Brain Acres', section: 'FarmSelection' },
  ],
};

export const HomeNavbarWithMoreThanThreeBreadcrumbs = Template.bind({});

HomeNavbarWithMoreThanThreeBreadcrumbs.args = {
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
  breadcrumbs: [
    { link: '/', label: 'Jolly Farm', section: 'FarmSelection' },
    { link: '/', label: 'Home', section: 'Home' },
    { link: '/', label: 'Brain Acres', section: 'FarmSelection' },
    { link: '/', label: 'Home', section: 'Home' },
  ],
};

export const HomeNavbarWithSpotlight = Template.bind({});

HomeNavbarWithSpotlight.args = {
  showSpotLight: true,
  resetSpotlight: () => {},
};

export const HomeNavbarWithProfileFloater = Template.bind({});
HomeNavbarWithProfileFloater.args = {
  resetSpotlight: () => {},
  defaultOpenFloater: 'profile',
};
