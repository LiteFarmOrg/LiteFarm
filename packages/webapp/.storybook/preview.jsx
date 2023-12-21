import React, { Suspense, useEffect } from 'react';
import state from './state';
import { action } from '@storybook/addon-actions';
import theme from '../src/assets/theme';
import { CssBaseline, ThemeProvider, StyledEngineProvider } from '@mui/material';
import { Provider } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { GlobalScss } from '../src/components/GlobalScss';
import i18n from '../src/locales/i18n';

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
  (Story, context) => {
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

    const { locale } = context.globals;

    useEffect(() => {
      i18n.changeLanguage(locale);
    }, [locale]);

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

export const globalTypes = {
  locale: {
    description: 'Change locale globally',
    defaultValue: 'en',
    toolbar: {
      icon: 'globe',
      dynamicTitle: true,
      items: ['en', 'pt', 'fr', 'es'],
    },
  },
};
