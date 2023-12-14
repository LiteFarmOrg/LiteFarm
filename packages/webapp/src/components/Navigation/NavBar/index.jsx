import { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import PureProfileFloater from '../Floater/ProfileFloater';
import { ReactComponent as NotificationIcon } from '../../../assets/images/notif.svg';
// TODO: use profile picture stored in db
import { ReactComponent as ProfilePicture } from '../../../assets/images/navbar/defaultpfp.svg';
import { logout } from '../../../util/jwt';
import { ReactComponent as Logo } from '../../../assets/images/navbar/nav-logo.svg';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import { BiMenu } from 'react-icons/bi';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import SlideMenu from '../../../containers/Navigation/SlideMenu';
import NavBarBreadcrumbs from '../NavBarBreadcrumbs';
import { getLanguageFromLocalStorage } from '../../../util/getLanguageFromLocalStorage';
import {
  NavbarSpotlightProvider,
  NavBarNotificationSpotlightProvider,
} from './NavbarSpotlightProvider';
import Alert from '../../../containers/Navigation/Alert';
import clsx from 'clsx';
import styles from './styles.module.scss';

export default function PureNavBar({
  showSpotLight,
  showNotification,
  resetSpotlight,
  history,
  defaultOpenFloater,
  justLogo = false,
  hidden = false,
  breadcrumbs = [],
}) {
  //Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const closeDrawer = () => setIsDrawerOpen(false);
  const burgerMenuOnClick = () => setIsDrawerOpen((prev) => !prev);
  const selectedLanguage = getLanguageFromLocalStorage();

  //Floater
  const [openFloater, setOpenFloater] = useState(defaultOpenFloater);
  const [NOTIFICATION, PROFILE] = ['notification', 'profile'];
  const isNotificationFloaterOpen = openFloater === NOTIFICATION;
  const isProfileFloaterOpen = openFloater === PROFILE;
  const closeFloater = () => {
    setOpenFloater(null);
  };
  const notificationIconClick = () => {
    closeFloater();
    const url = '/notifications';
    if (history.location.pathname === url) {
      // TODO click should update contents; is there better way than full page refresh?
      history.go(0);
    } else {
      history.push(url);
    }
  };
  const profileButtonOnClick = () => setOpenFloater(isProfileFloaterOpen ? null : PROFILE);
  const onClickAway = () => {
    setOpenFloater(null);
  };

  //PureProfileFloater
  const handleClick = (link) => {
    history.push(link);
    closeFloater();
  };
  const logOutClick = () => {
    logout();
    closeFloater();
  };
  const openTutorialsClick = () => {
    const playlistIDs = {
      es: 'PLDRpVZ4VsXJhghxfEQuApFQTeCWUbGBN9',
      pt: 'PLDRpVZ4VsXJg0ke20m47MmJq6uAJAlAGF',
      en: 'PLDRpVZ4VsXJgVGrmmXJooNqceXvre8IDY',
    };

    const playList = playlistIDs[selectedLanguage] || playlistIDs['en'];
    const url = 'https://www.youtube.com/playlist?list=' + playList;

    const win = window.open(url, '_blank');
    win.focus();
    closeFloater();
  };

  // Pure Notification Floater
  const notificationTeaserClick = () => {
    closeFloater();
  };

  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up('sm'));

  const content = (
    <>
      <IconButton
        data-cy="navbar-hamburger"
        edge="start"
        className={styles.menuButton}
        color="inherit"
        aria-label="open drawer"
        onClick={burgerMenuOnClick}
        size="large"
      >
        <BiMenu className={styles.burgerMenu} />
      </IconButton>
      <SwipeableDrawer
        anchor={'left'}
        open={isDrawerOpen}
        classes={{ root: styles.drawerRoot }}
        onClose={() => setIsDrawerOpen(false)}
        onOpen={() => setIsDrawerOpen(true)}
      >
        <SlideMenu history={history} closeDrawer={closeDrawer} />
      </SwipeableDrawer>
      {isMobile ? (
        <Logo className={clsx(styles.logo)} alt="Logo" onClick={() => history.push('/')} />
      ) : (
        <NavBarBreadcrumbs breadcrumbs={breadcrumbs} />
      )}
      {showNotification ? (
        <NavBarNotificationSpotlightProvider open={showNotification} onFinish={resetSpotlight} />
      ) : (
        <NavbarSpotlightProvider open={showSpotLight} onFinish={resetSpotlight} />
      )}
      <ClickAwayListener onClickAway={onClickAway}>
        <div className={styles.icons}>
          <IconButton
            data-cy="home-notificationButton"
            aria-label="notification icon"
            color="inherit"
            id="zerothStepNavBar"
            onClick={notificationIconClick}
            className={styles.iconButton}
            classes={{ root: styles.notificationButton }}
            size="large"
          >
            <NotificationIcon />
            <Alert />
          </IconButton>
          <PureProfileFloater
            openProfile={isProfileFloaterOpen}
            helpClick={() => handleClick('/help')}
            tutorialsClick={openTutorialsClick}
            myInfoClick={() => handleClick('/profile')}
            logOutClick={logOutClick}
            switchFarmClick={() => handleClick('/farm_selection')}
          >
            <IconButton
              data-cy="home-profileButton"
              edge="end"
              aria-label="profile icon"
              color="inherit"
              onClick={profileButtonOnClick}
              id="thirdStepNavBar"
              className={styles.iconButton}
              classes={{ root: styles.profileButton }}
              size="large"
            >
              <ProfilePicture />
            </IconButton>
          </PureProfileFloater>
        </div>
      </ClickAwayListener>
    </>
  );

  return (
    <AppBar position="sticky" className={clsx(styles.appBar, hidden && styles.displayNone)}>
      <Toolbar className={clsx(styles.toolbar, (justLogo || isMobile) && styles.centerContent)}>
        {justLogo ? <Logo history={history} /> : content}
      </Toolbar>
    </AppBar>
  );
}

PureNavBar.propTypes = {
  showSpotLight: PropTypes.bool,
  resetSpotlight: PropTypes.func,
  history: PropTypes.object,
  defaultOpenFloater: PropTypes.oneOf(['notification', 'profile']),
  justLogo: PropTypes.bool,
  hidden: PropTypes.bool,
  breadcrumbs: PropTypes.array,
};
