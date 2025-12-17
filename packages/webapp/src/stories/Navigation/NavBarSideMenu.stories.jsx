/*
 *  Copyright 2025 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

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
