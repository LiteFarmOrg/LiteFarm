import TopMenu from '../../components/Navigation/TopMenu/TopMenu';
import {
  componentDecoratorsWithoutPadding,
  navMenuControlDecorator,
} from '../Pages/config/Decorators';
import SideMenu from '../../components/Navigation/SideMenu';
import { Provider } from 'react-redux';
import { action } from '@storybook/addon-actions';

const adminStore = {
  getState: () => {
    return {
      entitiesReducer: {
        userFarmReducer: {
          byFarmIdUserId: {
            farm1: {
              user1: {
                farm_id: 'farm1',
                user_id: 'user1',
                role_id: 1,
              },
            },
          },
          farm_id: 'farm1',
          user_id: 'user1',
        },
      },
    };
  },
  subscribe: () => 0,
  dispatch: action('dispatch'),
};

const workerStore = {
  getState: () => {
    return {
      entitiesReducer: {
        userFarmReducer: {
          byFarmIdUserId: {
            farm1: {
              user2: {
                farm_id: 'farm1',
                user_id: 'user2',
                role_id: 3,
              },
            },
          },
          farm_id: 'farm1',
          user_id: 'user2',
        },
      },
    };
  },
  subscribe: () => 0,
  dispatch: action('dispatch'),
};

export default {
  title: 'Components/Navbar/SideMenu',
  decorators: [...componentDecoratorsWithoutPadding, ...navMenuControlDecorator],
  component: TopMenu,
};

export const WithAdminItems = ((args) => (
  <Provider store={adminStore}>
    <SideMenu {...args} />
  </Provider>
)).bind({});
WithAdminItems.args = {
  history: {
    push: () => {},
    location: { pathname: '/home' },
    replace: () => {},
  },
  isMobile: false,
  isDrawerOpen: true,
  onDrawerClose: () => {},
  isCompact: false,
  setIsCompact: () => {},
};

export const WithoutAdminItems = ((args) => (
  <Provider store={workerStore}>
    <SideMenu {...args} />
  </Provider>
)).bind({});
WithoutAdminItems.args = {
  history: {
    push: () => {},
    location: { pathname: '/home' },
    replace: () => {},
  },
  isMobile: false,
  isDrawerOpen: true,
  onDrawerClose: () => {},
  isCompact: false,
  setIsCompact: () => {},
};
