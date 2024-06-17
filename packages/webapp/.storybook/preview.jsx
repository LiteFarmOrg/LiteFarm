import React, { useEffect } from 'react';
import state from './state';
import { action } from '@storybook/addon-actions';
import theme from '../src/assets/theme';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/locales/i18n';
import { CssBaseline, ThemeProvider, StyledEngineProvider } from '@mui/material';
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
  (Story, context) => {
    // https://storybook.js.org/blog/internationalize-components-with-storybook/
    const { locale } = context.globals;

    useEffect(() => {
      i18n.changeLanguage(locale);
    }, [locale]);

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
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <GlobalScss />
            <CssBaseline />
            <I18nextProvider i18n={i18n}>
              <Story />
            </I18nextProvider>
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    );
  },
];

// https://storybook.js.org/blog/internationalize-components-with-storybook/
export const globalTypes = {
  locale: {
    name: 'Locale',
    description: 'Internationalization locale',
    toolbar: {
      icon: 'globe',
      items: [
        { value: 'en', title: 'English' },
        { value: 'es', title: 'Spanish' },
        { value: 'fr', title: 'French' },
        { value: 'pt', title: 'Portuguese' },
      ],
      showName: true,
    },
  },
};
