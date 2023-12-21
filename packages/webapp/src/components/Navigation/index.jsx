import { useState } from 'react';
import { useTheme } from '@mui/styles';
import { IconButton, useMediaQuery } from '@mui/material';
import { Menu } from '@mui/icons-material';
import TopMenu from './Menus/TopMenu';
import SideMenu from '../../containers/Navigation/SideMenu';
import {
  NavbarSpotlightProvider,
  NavBarNotificationSpotlightProvider,
} from './NavbarSpotlightProvider';
import PropTypes from 'prop-types';
import Drawer from '../Drawer';
import styles from './styles.module.scss';

export default function PureNavigation({
  showNavigationSpotlight,
  showNotificationSpotlight,
  resetSpotlight,
  history,
  isFarmSelected,
  hidden,
  children,
}) {
  // Side Drawer
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    !hidden && (
      <>
        {isFarmSelected && (
          <>
            {/* Sidebar Menu */}
            {isMobile ? (
              <Drawer
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
                fullHeight
                responsiveModal={false}
                classes={{
                  drawer: styles.drawer,
                  header: styles.drawerHeader,
                  content: styles.drawerContent,
                }}
              >
                <SideMenu history={history} closeDrawer={closeSidebar} />
              </Drawer>
            ) : (
              <SideMenu history={history} classes={{ container: styles.sideMenu }} />
            )}
            <NavbarSpotlightProvider
              open={!showNotificationSpotlight && showNavigationSpotlight}
              onFinish={resetSpotlight}
            />
            <NavBarNotificationSpotlightProvider
              open={showNotificationSpotlight}
              onFinish={resetSpotlight}
            />
          </>
        )}
        <div className={styles.mainColumn}>
          <TopMenu
            history={history}
            isMobile={isMobile}
            showNavigation={isFarmSelected}
            onClickBurger={openSidebar}
          />
          {children}
        </div>
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
