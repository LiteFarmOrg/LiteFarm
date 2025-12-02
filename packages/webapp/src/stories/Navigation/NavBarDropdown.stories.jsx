import TopMenu from '../../components/Navigation/TopMenu/TopMenu';
import {
  componentDecoratorsGreyBackground,
  navMenuControlDecorator,
} from '../Pages/config/Decorators';

export default {
  title: 'Components/Navbar/TopMenu',
  decorators: [...componentDecoratorsGreyBackground, ...navMenuControlDecorator],
  component: TopMenu,
};

export const NavbarTopMenu = ((args) => <TopMenu {...args} />).bind({});
NavbarTopMenu.args = {
  history: {
    push: () => {},
    location: { pathname: '/home' },
    replace: () => {},
  },
  isMobile: false,
  showNavActions: true,
  onClickBurger: () => {},
  showNav: true,
};
