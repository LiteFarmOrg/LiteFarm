import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ReactComponent as NotificationIcon } from '../../../assets/images/notif.svg';
// TODO: use profile picture stored in db
import { ReactComponent as ProfilePicture } from '../../../assets/images/navbar/defaultpfp.svg';
import { ReactComponent as IconLogo } from '../../../assets/images/navbar/nav-logo.svg';
import { ReactComponent as Logo } from '../../../assets/images/middle_logo.svg';
import ProfileMenu from '../Menus/ProfileMenu';
import { AppBar, Toolbar, IconButton } from '@mui/material';
import { BiMenu } from 'react-icons/bi';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import SlideMenu from '../../../containers/Navigation/SlideMenu';
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
}) {
  //Side Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const closeDrawer = () => setIsDrawerOpen(false);
  const selectedLanguage = getLanguageFromLocalStorage();

  //Bottom Drawer
  const [isBottomDrawerOpen, setIsBottomDrawerOpen] = useState(false);
  const closeBottomDrawer = () => setIsBottomDrawerOpen(false);
  const burgerMenuOnClick = () => setIsBottomDrawerOpen((prev) => !prev);

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
  const profileButtonOnClick = () => {
    isMobile && burgerMenuOnClick();
    setOpenFloater(isProfileFloaterOpen ? null : PROFILE);
  };
  const onClickAway = () => {
    setOpenFloater(null);
  };

  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up('sm'));

  const profileIconRef = useRef(null);

  const mobileOnlyContent = (
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
      <IconLogo className={clsx(styles.logo)} alt="Logo" onClick={() => history.push('/')} />
    </>
  );

  const showMainNavigation = (
    <>
      <SwipeableDrawer
        anchor={'left'}
        open={isDrawerOpen}
        classes={{ root: styles.drawerRoot }}
        onClose={() => setIsDrawerOpen(false)}
        onOpen={() => setIsDrawerOpen(true)}
      >
        <SlideMenu history={history} closeDrawer={closeDrawer} />
      </SwipeableDrawer>
      {isMobile && mobileOnlyContent}
      {showNotification ? (
        <NavBarNotificationSpotlightProvider open={showNotification} onFinish={resetSpotlight} />
      ) : (
        <NavbarSpotlightProvider open={showSpotLight} onFinish={resetSpotlight} />
      )}
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
        <IconButton
          data-cy="home-profileButton"
          edge="end"
          aria-label="profile icon"
          color="inherit"
          onClick={profileButtonOnClick}
          id="profile-navigation-button"
          className={styles.iconButton}
          classes={{ root: styles.profileButton }}
          size="large"
          aria-controls={isProfileFloaterOpen ? 'profile-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={isProfileFloaterOpen ? 'true' : undefined}
          ref={profileIconRef}
        >
          <ProfilePicture />
        </IconButton>
        <ProfileMenu
          history={history}
          open={isProfileFloaterOpen}
          onClose={closeFloater}
          target={profileIconRef}
          closeFloater={closeFloater}
          isMobile={isMobile}
          isBottomDrawerOpen={isBottomDrawerOpen}
          setIsBottomDrawerOpen={setIsBottomDrawerOpen}
        />
      </div>
    </>
  );

  return (
    <AppBar position="sticky" className={clsx(styles.appBar, hidden && styles.displayNone)}>
      <Toolbar className={clsx(styles.toolbar, (justLogo || isMobile) && styles.centerContent)}>
        {justLogo ? <Logo history={history} /> : showMainNavigation}
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
};
