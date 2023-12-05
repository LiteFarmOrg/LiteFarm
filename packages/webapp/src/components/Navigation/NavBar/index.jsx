import React, { useState } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
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
import { useTranslation } from 'react-i18next';
import SmallerLogo from '../../../assets/images/smaller_logo.svg';
import SmallLogo from '../../../assets/images/small_logo.svg';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import { BiMenu } from 'react-icons/bi';
import { colors } from '../../../assets/theme';
import { ClickAwayListener, SwipeableDrawer } from '@mui/material';
import SlideMenu from '../../../containers/Navigation/SlideMenu';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { getLanguageFromLocalStorage } from '../../../util/getLanguageFromLocalStorage';
import {
  NavbarSpotlightProvider,
  NavBarNotificationSpotlightProvider,
} from './NavbarSpotlightProvider';
import Alert from '../../../containers/Navigation/Alert';

const useStyles = makeStyles((theme) => ({
  menuButton: {
    position: 'absolute',
    padding: 0,
    left: '24px',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  icons: {
    display: 'flex',
    position: 'absolute',
    right: '8px',
  },
  appBar: {
    background: 'none',
    boxShadow: 'none',
    height: 'var(--global-navbar-height)',
    [theme.breakpoints.up('md')]: {
      '--global-navbar-height': '72px',
    },
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexGrow: 1,
    alignItems: 'center',
    [theme.breakpoints.up('md')]: {
      justifyContent: 'center',
    },
  },
  notificationButton: {
    transform: 'translateY(1px)',
  },
  profileButton: {},
  iconButton: {
    margin: theme.spacing(1),
    padding: 0,
  },
  burgerMenu: {
    fontSize: '32px',
    color: colors.teal700,
    [theme.breakpoints.up('md')]: {
      fontSize: '40px',
    },
  },
  green: {
    color: colors.teal700,
  },
  p: {
    marginBottom: '12px',
  },
  black: {
    color: colors.grey900,
  },
  drawerRoot: {
    zIndex: '1302 !important',
  },
}));

export default function PureNavBar({
  showSpotLight,
  showNotification,
  resetSpotlight,
  history,
  defaultOpenFloater,
}) {
  const classes = useStyles();
  const { t } = useTranslation([
    'translation',
    'crop',
    'common',
    'disease',
    'task',
    'expense',
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
  const dispatch = useDispatch();
  //Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const closeDrawer = () => setIsDrawerOpen(false);
  const burgerMenuOnClick = () => setIsDrawerOpen((prev) => !prev);
  const selectedLanguage = getLanguageFromLocalStorage();

  //Floater
  const [openFloater, setOpenFloater] = useState(defaultOpenFloater);
  const [FARM, NOTIFICATION, PROFILE] = ['farm', 'notification', 'profile'];
  const isFarmFloaterOpen = openFloater === FARM;
  const isNotificationFloaterOpen = openFloater === NOTIFICATION;
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

  // Pure Notification Floater
  const notificationTeaserClick = () => {
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
    <AppBar position="sticky" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <IconButton
          data-cy="navbar-hamburger"
          edge="start"
          className={classes.menuButton}
          color="inherit"
          aria-label="open drawer"
          onClick={burgerMenuOnClick}
          size="large"
        >
          <BiMenu className={classes.burgerMenu} />
        </IconButton>
        <SwipeableDrawer
          anchor={'left'}
          open={isDrawerOpen}
          classes={{ root: classes.drawerRoot }}
          onClose={() => setIsDrawerOpen(false)}
          onOpen={() => setIsDrawerOpen(true)}
        >
          <SlideMenu history={history} closeDrawer={closeDrawer} />
        </SwipeableDrawer>
        <Logo history={history} />
        {showNotification ? (
          <NavBarNotificationSpotlightProvider open={showNotification} onFinish={resetSpotlight} />
        ) : (
          <NavbarSpotlightProvider open={showSpotLight} onFinish={resetSpotlight} />
        )}
        <ClickAwayListener onClickAway={onClickAway}>
          <div className={classes.icons}>
            <IconButton
              data-cy="home-notificationButton"
              aria-label="notification icon"
              color="inherit"
              id="zerothStepNavBar"
              onClick={notificationIconClick}
              className={classes.iconButton}
              classes={{ root: classes.notificationButton }}
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
                className={classes.iconButton}
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
              className={classes.iconButton}
              classes={{ root: classes.notificationButton }}
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
                className={classes.iconButton}
                classes={{ root: classes.profileButton }}
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
