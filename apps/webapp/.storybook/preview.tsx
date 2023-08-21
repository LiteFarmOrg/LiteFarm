/*
 *  Copyright (C) 2023 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (preview.tsx) is part of LiteFarm.
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

import React, { Suspense } from 'react';
import state from './state';
import { action } from '@storybook/addon-actions';
import theme from '../src/assets/theme';
import {
  CssBaseline,
  ThemeProvider,
  StyledEngineProvider,
} from '@mui/material';
import { Provider } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { GlobalScss } from '../src/components/GlobalScss';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  layout: 'fullscreen',
  chromatic: { disableSnapshot: true },
};
const store = {
  getState: () => {
    return state;
  },
  subscribe: () => 0,
  dispatch: action('dispatch'),
};
export const decorators = [
  (Story) => {
    const { t, ready } = useTranslation(
      [
        'certifications',
        'crop_group',
        'crop_nutrients',
        'filter',
        'translation',
        'crop',
        'common',
        'disease',
        'task',
        'expense',
        'fertilizer',
        'message',
        'gender',
        'role',
        'harvest_uses',
        'soil',
      ],
      { useSuspense: false }
    );
    return (
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <GlobalScss />
            <CssBaseline />
            <Story />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );
  },
];
