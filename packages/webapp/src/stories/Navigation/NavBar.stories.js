import React from 'react';
import { action } from '@storybook/addon-actions';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import history from './../../history';
import NavBar from '../../components/Navigation/NavBar';
import NoFarmNavBar from '../../components/Navigation/NoFarmNavBar';
import { themeWrapper, useI18next } from '../Pages/config/decorators';

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
  decorators: [
    (story) => {
      const ready = useI18next();
      return ready ? (
        <Provider store={store}>
          <Router history={history}>{story()}</Router>
        </Provider>
      ) : (
        'loading'
      );
    },
    themeWrapper,
  ],
  component: NavBar,
};

export const SignupNavbar = (() => <NoFarmNavBar />).bind({});

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
