import { action } from '@storybook/addon-actions';
import PureNavigation from '../../components/Navigation';
import { navMenuControlDecorator } from '../Pages/config/Decorators';

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
  decorators: navMenuControlDecorator,
  component: PureNavigation,
};

export const SignupNavbar = ((args) => <PureNavigation {...args} justLogo />).bind({});
SignupNavbar.args = {
  history: {
    push: () => {},
    location: { pathname: '/home' },
    replace: () => {},
  },
  showNavigationSpotlight: false,
  showNotificationSpotlight: false,
  resetSpotlight: () => {},
  showNav: true,
  showNavActions: false,
  children: null,
  isCompactSideMenu: false,
  setIsCompactSideMenu: () => {},
};

const Template = (args) => <PureNavigation {...args} />;

export const HomeNavbar = Template.bind({});

HomeNavbar.args = {
  history: {
    push: () => {},
    location: { pathname: '/home' },
    replace: () => {},
  },
  showNavigationSpotlight: false,
  showNotificationSpotlight: false,
  resetSpotlight: () => {},
  showNav: true,
  showNavActions: true,
  children: null,
  isCompactSideMenu: false,
  setIsCompactSideMenu: () => {},
};

export const HomeNavbarWithSpotlight = Template.bind({});

HomeNavbarWithSpotlight.args = {
  history: {
    push: () => {},
    location: { pathname: '/home' },
    replace: () => {},
  },
  showNavigationSpotlight: true,
  resetSpotlight: () => {},
  showNav: true,
  showNavActions: true,
  children: null,
  isCompactSideMenu: false,
  setIsCompactSideMenu: () => {},
};
