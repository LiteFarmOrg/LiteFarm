import { useState } from 'react';
import { useTheme } from '@mui/styles';
import { SwipeableDrawer, useMediaQuery } from '@mui/material';
import TopMenu from './Menus/TopMenu';
import SlideMenu from '../../containers/Navigation/SlideMenu';
import {
  NavbarSpotlightProvider,
  NavBarNotificationSpotlightProvider,
} from './NavbarSpotlightProvider';
import PropTypes from 'prop-types';
export default function PureNavigation({
  showNavigationSpotLight,
  showNotificationSpotlight,
  resetSpotlight,
  history,
  defaultOpenMenu,
  isFarmSelected,
  hidden,
}) {
  //Side Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const closeDrawer = () => setIsDrawerOpen(false);

  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up('sm'));

  return (
    !hidden && (
      <>
        <TopMenu
          history={history}
          isMobile={isMobile}
          defaultOpenMenu={defaultOpenMenu}
          showNavigation={isFarmSelected}
        />
        {isFarmSelected && (
          <>
            <SwipeableDrawer
              anchor={'left'}
              open={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              onOpen={() => setIsDrawerOpen(true)}
            >
              <SlideMenu history={history} closeDrawer={closeDrawer} />
            </SwipeableDrawer>
            <NavbarSpotlightProvider
              open={!showNotificationSpotlight && showNavigationSpotLight}
              onFinish={resetSpotlight}
            />
            <NavBarNotificationSpotlightProvider
              open={showNotificationSpotlight}
              onFinish={resetSpotlight}
            />
          </>
        )}
      </>
    )
  );
}

PureNavigation.propTypes = {
  showSpotLight: PropTypes.bool,
  resetSpotlight: PropTypes.func,
  history: PropTypes.object,
  defaultOpenMenu: PropTypes.bool,
  isFarmSelected: PropTypes.bool,
  hidden: PropTypes.bool,
};
