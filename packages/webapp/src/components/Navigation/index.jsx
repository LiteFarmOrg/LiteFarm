import { useState } from 'react';
import { useTheme } from '@mui/styles';
import { IconButton, useMediaQuery } from '@mui/material';
import PropTypes from 'prop-types';

import TopMenu from './Menus/TopMenu';
import SideMenu from '../../containers/Navigation/SideMenu';
import {
  NavbarSpotlightProvider,
  NavBarNotificationSpotlightProvider,
} from './NavbarSpotlightProvider';
import Drawer from '../Drawer';
import { ReactComponent as CollapseMenuIcon } from '../../assets/images/nav/collapse-menu.svg';
import styles from './styles.module.scss';
import clsx from 'clsx';

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
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isCompactSideMenu, setIsCompactSideMenu] = useState(false);
  const [hasSideMenuBeenExpanded, setHasSideMenuBeenExpanded] = useState(false);

  const toggleSideMenu = () => {
    setHasSideMenuBeenExpanded(isCompactSideMenu);
    setIsCompactSideMenu(!isCompactSideMenu);
  };

  const openSideMenu = () => setIsSideMenuOpen(true);
  const closeSideMenu = () => setIsSideMenuOpen(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return hidden ? (
    children
  ) : (
    <>
      {isFarmSelected && (
        <>
          {/* Sidebar Menu */}
          {isMobile ? (
            <Drawer
              isOpen={isSideMenuOpen}
              onClose={closeSideMenu}
              fullHeight
              responsiveModal={false}
              classes={{
                drawer: styles.drawer,
                header: styles.drawerHeader,
                content: styles.drawerContent,
              }}
            >
              <SideMenu history={history} closeDrawer={closeSideMenu} />
            </Drawer>
          ) : (
            <>
              <IconButton
                size="large"
                className={clsx(
                  styles.menuToggle,
                  isCompactSideMenu && styles.compactMenuToggle,
                  hasSideMenuBeenExpanded && styles.expandedMenuToggle,
                )}
                onClick={toggleSideMenu}
              >
                <CollapseMenuIcon />
              </IconButton>
              <SideMenu
                history={history}
                classes={{ container: styles.sideMenu }}
                isCompact={isCompactSideMenu}
                hasBeenExpanded={hasSideMenuBeenExpanded}
              />
            </>
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
          onClickBurger={openSideMenu}
        />
        {children}
      </div>
    </>
  );
}

PureNavigation.propTypes = {
  showSpotLight: PropTypes.bool,
  resetSpotlight: PropTypes.func,
  history: PropTypes.object,
  isFarmSelected: PropTypes.bool,
  hidden: PropTypes.bool,
};
