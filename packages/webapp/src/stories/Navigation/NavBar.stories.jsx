import { action } from '@storybook/addon-actions';
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
  isFarmSelected: true,
};

export const HomeNavbarWithSpotlight = Template.bind({});

HomeNavbarWithSpotlight.args = {
  showNavigationSpotlight: true,
  resetSpotlight: () => {},
  isFarmSelected: true,
};
