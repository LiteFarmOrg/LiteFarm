import { useState } from 'react';
import { useTheme } from '@mui/styles';
import { SwipeableDrawer, useMediaQuery } from '@mui/material';
import TopMenu from './Menus/TopMenu';
import SlideMenu from '../../containers/Navigation/SlideMenu';
import {
  NavbarSpotlightProvider,
  NavBarNotificationSpotlightProvider,
} from './NavbarSpotlightProvider';
import ReleaseBadgeHandler from '../../containers/ReleaseBadgeHandler';
import PropTypes from 'prop-types';
export default function PureNavigation({
  showNavigationSpotlight,
  showNotificationSpotlight,
  resetSpotlight,
  history,
  isFarmSelected,
  hidden,
}) {
  //Side Drawer
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeDrawer = () => setIsSidebarOpen(false);

  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up('sm'));

  return (
    !hidden && (
      <>
        <TopMenu
          history={history}
          isMobile={isMobile}
          showNavigation={isFarmSelected}
          onClickBurger={setIsSidebarOpen}
        />
        {isFarmSelected && (
          <>
            {/* Sidebar Menu */}
            <SwipeableDrawer
              anchor={'left'}
              open={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              onOpen={() => setIsSidebarOpen(true)}
            >
              <SlideMenu history={history} closeDrawer={closeDrawer} />
            </SwipeableDrawer>
            <NavbarSpotlightProvider
              open={!showNotificationSpotlight && showNavigationSpotlight}
              onFinish={resetSpotlight}
            />
            <NavBarNotificationSpotlightProvider
              open={showNotificationSpotlight}
              onFinish={resetSpotlight}
            />
            <ReleaseBadgeHandler />
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
  isFarmSelected: PropTypes.bool,
  hidden: PropTypes.bool,
};
