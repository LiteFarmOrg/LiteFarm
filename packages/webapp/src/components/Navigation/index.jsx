import { useState } from 'react';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import PropTypes from 'prop-types';

import TopMenu from './TopMenu/TopMenu';
import SideMenu from '../../containers/Navigation/SideMenu';
import {
  NavbarSpotlightProvider,
  NavBarNotificationSpotlightProvider,
} from './NavbarSpotlightProvider';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';

export default function PureNavigation({
  showNavigationSpotlight,
  showNotificationSpotlight,
  resetSpotlight,
  history,
  isFarmSelected,
  hidden,
  children,
  isCompactSideMenu,
  setIsCompactSideMenu,
}) {
  // This namespacing is needed for translations to work throughout the app
  const { t } = useTranslation([
    'translation',
    'crop',
    'common',
    'disease',
    'task',
    'expense',
    'revenue',
    'fertilizer',
    'message',
    'gender',
    'role',
    'crop_nutrients',
    'harvest_uses',
    'soil',
    'certifications',
    'crop_group',
  ]);

  // Side Drawer
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

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
          <SideMenu
            history={history}
            isMobile={isMobile}
            isDrawerOpen={isSideMenuOpen}
            onDrawerClose={closeSideMenu}
            isCompact={isCompactSideMenu}
            setIsCompact={setIsCompactSideMenu}
          />
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
  isCompactSideMenu: PropTypes.bool,
  setIsCompactSideMenu: PropTypes.func,
};
