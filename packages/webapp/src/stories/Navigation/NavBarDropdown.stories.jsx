import { Provider } from 'react-redux';
import { action } from '@storybook/addon-actions';
import TopMenu from '../../components/Navigation/TopMenu/TopMenu';
import {
  componentDecoratorsGreyBackground,
  navMenuControlDecorator,
} from '../Pages/config/Decorators';
import state from '../../../.storybook/state';

export default {
  title: 'Components/Navbar/TopMenu',
  decorators: [...componentDecoratorsGreyBackground, ...navMenuControlDecorator],
  component: TopMenu,
  args: {
    history: {
      push: () => {},
      location: { pathname: '/home' },
      replace: () => {},
    },
    isMobile: false,
    showNavActions: true,
    onClickBurger: () => {},
    showNav: true,
  },
};

export const NavbarTopMenu = ((args) => <TopMenu {...args} />).bind({});

const offlineStore = {
  getState: () => ({
    ...state,
    tempStateReducer: {
      offlineDetectorReducer: { isOffline: true },
      homeReducer: { showHelpRequestModal: undefined },
    },
  }),
  subscribe: () => 0,
  dispatch: action('dispatch'),
};

export const NavbarTopMenuOffline = {
  render: (args) => (
    <Provider store={offlineStore}>
      <TopMenu {...args} />
    </Provider>
  ),
};
