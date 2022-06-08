import React, { Suspense } from 'react';
import state from './state';
import { action } from '@storybook/addon-actions';
import theme from '../src/assets/theme';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
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
      { useSuspense: false },
    );
    return (
      <Suspense fallback={<p>Loading...</p>}>
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <GlobalScss />
            <CssBaseline />
            <Story />
          </ThemeProvider>
        </Provider>
      </Suspense>
    );
  },
];
