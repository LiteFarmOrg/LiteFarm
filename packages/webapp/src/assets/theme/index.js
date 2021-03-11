import { createMuiTheme } from '@material-ui/core';

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
  red700: '#ec4c47',
  red400: '#f58282',
  orange700: '#ffa73f',
  orange400: '#ffc888',
  purple700: '#8f26f0',
  purple400: '#ffe55b',
  brightGreen700: '#06ab16',
  brightGreen400: '#a6f7ae',
  cyan700: '#03a6ca',
  cayn400: '#4fdbfa',
  blue700: '#3d8bed',
  grey1: '#333333',
  brown700: '#AA5F04',
};

const theme = createMuiTheme({
  palette: {
    primary: {
      contrastText: colors.grey900,
      main: colors.yellow300,
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
      default: '#fff',
      paper: '#fff',
    },
    text: {
      primary: colors.grey900,
      disabled: colors.grey600,
      hint: colors.grey600,
    },
    action: {
      hover: colors.green100,
      hoverOpacity: 0.5,
      active: colors.green100,
      selected: colors.green100,
      focus: colors.green100,
    },
  },
  typography: {
    fontFamily: '"Open Sans"," SansSerif", serif',
  },
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          backgroundColor: '#fff',
          overflowX: 'hidden !important',
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
