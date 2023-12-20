import React, { useState } from 'react';
import { useTheme } from '@mui/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import PureProfileFloater from '../Floater/ProfileFloater';
import { ReactComponent as NotificationIcon } from '../../../assets/images/notif.svg';
import { ReactComponent as MyFarmIcon } from '../../../assets/images/my-farm.svg';
import { ReactComponent as MyFarmIconSpan } from '../../../assets/images/my-farm-es.svg';
import { ReactComponent as MyFarmIconPort } from '../../../assets/images/my-farm-pt.svg';
import { ReactComponent as MyFarmIconFren } from '../../../assets/images/my-farm-fr.svg';
import { ReactComponent as TaskIcon } from '../../../assets/images/task_icon.svg';
// TODO: use profile picture stored in db
import { ReactComponent as ProfilePicture } from '../../../assets/images/navbar/defaultpfp.svg';
import PureMyFarmFloater from '../Floater/MyFarmFloater';
import { logout } from '../../../util/jwt';
import SmallerLogo from '../../../assets/images/smaller_logo.svg';
import SmallLogo from '../../../assets/images/small_logo.svg';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import { BiMenu } from 'react-icons/bi';
import { ClickAwayListener } from '@mui/material';
import SlideMenu from '../../../containers/Navigation/SlideMenu';
import PropTypes from 'prop-types';
import { getLanguageFromLocalStorage } from '../../../util/getLanguageFromLocalStorage';
import {
  NavbarSpotlightProvider,
  NavBarNotificationSpotlightProvider,
} from './NavbarSpotlightProvider';
import Alert from '../../../containers/Navigation/Alert';
import styles from './styles.module.scss';
import Drawer from '../../Drawer';

export default function PureNavBar({
  showSpotLight,
  showNotification,
  resetSpotlight,
  history,
  defaultOpenFloater,
}) {
  const selectedLanguage = getLanguageFromLocalStorage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const closeDrawer = () => setIsDrawerOpen(false);
  const burgerMenuOnClick = () => setIsDrawerOpen((prev) => !prev);

  // Floater
  const [openFloater, setOpenFloater] = useState(defaultOpenFloater);
  const [FARM, PROFILE] = ['farm', 'notification', 'profile'];
  const isFarmFloaterOpen = openFloater === FARM;
  const isProfileFloaterOpen = openFloater === PROFILE;

  const closeFloater = () => {
    setOpenFloater(null);
  };
  const farmButtonOnClick = () => setOpenFloater(isFarmFloaterOpen ? null : FARM);
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
  const taskIconClick = () => {
    closeFloater();
    history.push('/tasks');
  };
  const profileButtonOnClick = () => setOpenFloater(isProfileFloaterOpen ? null : PROFILE);
  const onClickAway = () => {
    setOpenFloater(null);
  };

  const farmInfoClick = () => {
    history.push({
      pathname: '/farm',
    });
    closeFloater();
  };
  const farmMapClick = () => {
    history.push('/map');
    closeFloater();
  };
  const peopleClick = () => {
    history.push({
      pathname: '/people',
    });
    closeFloater();
  };
  const certificationClick = () => {
    history.push('/certification');
    closeFloater();
  };

  //PureProfileFloater
  const helpClick = () => {
    history.push('/help');
    closeFloater();
  };
  const switchFarmClick = () => {
    history.push('/farm_selection');
    closeFloater();
  };
  const logOutClick = () => {
    logout();
    closeFloater();
  };
  const myInfoClick = () => {
    history.push('/profile');
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

  const getLanguageFarmIcon = (language) => {
    switch (language) {
      case 'pt':
        return <MyFarmIconPort />;
      case 'es':
        return <MyFarmIconSpan />;
      case 'fr':
        return <MyFarmIconFren />;
      default:
        return <MyFarmIcon />;
    }
  };

  return (
    <AppBar position="sticky" className={styles.appBar}>
      <Toolbar className={styles.toolbar}>
        {isMobile && (
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
        )}
        {isMobile && (
          <Drawer
            isOpen={isDrawerOpen}
            onClose={closeDrawer}
            fullHeight
            responsiveModal={false}
            classes={{
              drawer: styles.drawer,
              backdrop: styles.drawerBackdrop,
              header: styles.drawerHeader,
              content: styles.drawerContent,
            }}
          >
            <SlideMenu history={history} closeDrawer={closeDrawer} />
          </Drawer>
        )}
        <Logo history={history} />
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

            <PureMyFarmFloater
              openProfile={isFarmFloaterOpen}
              farmInfoClick={farmInfoClick}
              farmMapClick={farmMapClick}
              peopleClick={peopleClick}
              certificationClick={certificationClick}
            >
              <IconButton
                data-cy="home-farmButton"
                aria-label="farm-icon"
                color="inherit"
                id="firstStepNavBar"
                className={styles.iconButton}
                onClick={farmButtonOnClick}
                size="large"
              >
                {getLanguageFarmIcon(selectedLanguage)}
              </IconButton>
            </PureMyFarmFloater>

            <IconButton
              data-cy="home-taskButton"
              aria-label="notification icon"
              color="inherit"
              id="secondStepNavBar"
              onClick={taskIconClick}
              className={styles.iconButton}
              classes={{ root: styles.notificationButton }}
              size="large"
            >
              <TaskIcon />
            </IconButton>

            <PureProfileFloater
              openProfile={isProfileFloaterOpen}
              helpClick={helpClick}
              tutorialsClick={openTutorialsClick}
              myInfoClick={myInfoClick}
              logOutClick={logOutClick}
              switchFarmClick={switchFarmClick}
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
      </Toolbar>
    </AppBar>
  );
}

const Logo = ({ history }) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));
  return (
    <img
      src={matches ? SmallLogo : SmallerLogo}
      style={{ marginLeft: matches ? 0 : '36px', cursor: 'pointer' }}
      alt="Logo"
      onClick={() => history.push('/')}
    />
  );
};

PureNavBar.propTypes = {
  showSpotLight: PropTypes.bool,
  resetSpotlight: PropTypes.func,
  history: PropTypes.object,
  defaultOpenFloater: PropTypes.oneOf(['farm', 'notification', 'profile']),
};
