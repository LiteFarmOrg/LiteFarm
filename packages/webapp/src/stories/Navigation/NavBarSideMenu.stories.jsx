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

import {
  componentDecoratorsWithoutPadding,
  navMenuControlDecorator,
} from '../Pages/config/Decorators';
import SideMenu from '../../components/Navigation/SideMenu';
import { Provider } from 'react-redux';
import { action } from '@storybook/addon-actions';

const adminEntitiesReducer = {
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
};

const adminStore = {
  getState: () => {
    return {
      entitiesReducer: adminEntitiesReducer,
    };
  },
  subscribe: () => 0,
  dispatch: action('dispatch'),
};

const workerEntitiesReducer = {
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
};

const workerStore = {
  getState: () => {
    return {
      entitiesReducer: workerEntitiesReducer,
    };
  },
  subscribe: () => 0,
  dispatch: action('dispatch'),
};

const offlineAdminStore = {
  getState: () => {
    return {
      entitiesReducer: adminEntitiesReducer,
      tempStateReducer: { offlineDetectorReducer: { isOffline: true } },
    };
  },
  subscribe: () => 0,
  dispatch: action('dispatch'),
};

const offlineWorkerStore = {
  getState: () => {
    return {
      entitiesReducer: workerEntitiesReducer,
      tempStateReducer: { offlineDetectorReducer: { isOffline: true } },
    };
  },
  subscribe: () => 0,
  dispatch: action('dispatch'),
};

export default {
  title: 'Components/Navbar/SideMenu',
  decorators: [...componentDecoratorsWithoutPadding, ...navMenuControlDecorator],
  component: SideMenu,
  args: {
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
  },
};

export const WithAdminItems = {
  render: (args) => (
    <Provider store={adminStore}>
      <SideMenu {...args} />
    </Provider>
  ),
};

export const WithoutAdminItems = {
  render: (args) => (
    <Provider store={workerStore}>
      <SideMenu {...args} />
    </Provider>
  ),
};

export const WithAdminItemsOffline = {
  render: (args) => (
    <Provider store={offlineAdminStore}>
      <SideMenu {...args} />
    </Provider>
  ),
};

export const WithoutAdminItemsOffline = {
  render: (args) => (
    <Provider store={offlineWorkerStore}>
      <SideMenu {...args} />
    </Provider>
  ),
};
