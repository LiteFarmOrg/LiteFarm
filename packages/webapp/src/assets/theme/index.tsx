import { createTheme, StyledEngineProvider } from '@mui/material';
import { ThemeProvider, Theme } from '@mui/material/styles';
import '@mui/styles';
import React, { FC, ReactNode } from 'react';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}
declare module '@mui/material/styles' {
  interface Palette {
    yellow300: Palette['primary'];
  }
  interface PaletteOptions {
    yellow300?: PaletteOptions['primary'];
  }
}

export const colors = {
  teal900: '#085d50',
  teal700: '#028577',
  teal600: '#3ea992',
  teal500: '#89d1c7',
  teal100: '#f1fbf9',
  green700: '#78c99e',
  green400: '#a8e6bd',
  green200: '#c7efd3',
  green100: '#e3f8ec',
  yellow700: '#ffb800',
  yellow400: '#fed450',
  yellow300: '#fce38d',
  grey900: '#282b36',
  grey600: '#66738a',
  grey500: '#9faabe',
  grey400: '#d4dae3',
  grey200: '#f3f6fb',
  grey100: '#fafafd',
  overlay: 'rgba(36, 39, 48, 0.5)',
  red700: '#D02620',
  red400: '#f58282',
  orange700: '#ffa73f',
  orange400: '#ffc888',
  purple700: '#8f26f0',
  purple400: '#ffe55b',
  brightGreen700: '#037A0F',
  brightGreen400: '#a6f7ae',
  cyan700: '#03a6ca',
  cayn400: '#4fdbfa',
  blue200: '#e9f3ff',
  blue700: '#0669E1',
  grey1: '#333333',
  brown700: '#AA5F04',
  brown900: '#7E4C0E',
};

const theme = createTheme({
  palette: {
    primary: {
      contrastText: colors.grey900,
      main: colors.teal700,
    },
    secondary: {
      contrastText: colors.grey900,
      main: '#fff',
    },
    success: {
      contrastText: colors.grey900,
      main: colors.brightGreen700,
    },
    info: {
      contrastText: colors.grey900,
      main: colors.blue700,
    },
    warning: {
      contrastText: colors.grey900,
      main: colors.orange700,
    },
    error: {
      contrastText: colors.grey900,
      main: colors.red700,
    },
    background: {
      default: '#FAFCFB',
      paper: '#FFF',
    },
    text: {
      primary: colors.grey900,
      disabled: colors.grey600,
    },
    action: {
      hover: colors.green100,
      hoverOpacity: 0.5,
      active: colors.green100,
      selected: colors.green100,
      focus: colors.green100,
    },
    yellow300: {
      main: colors.yellow300,
      light: colors.yellow300,
      dark: colors.yellow300,
      contrastText: colors.yellow300,
    },
  },
  typography: {
    fontFamily: '"Open Sans"," SansSerif", serif',
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          height: '100%',
        },
        body: {
          height: '100%',
          backgroundColor: '#FAFCFB',
          overflowX: 'hidden',
          fontSize: '0.875rem',
        },
        '*': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
        },
      },
    },
  },
});

export default theme;
const defaultTheme = createTheme({});
export const DefaultThemeProvider: FC<{ children: ReactNode }> = ({ children }) => (
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>
  </StyledEngineProvider>
);
