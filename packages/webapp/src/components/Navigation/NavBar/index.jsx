import React, { useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import PureProfileFloater from '../Floater/ProfileFloater';
import { ReactComponent as MyFarmIcon } from '../../../assets/images/my-farm.svg';
import { ReactComponent as MyFarmIconSpan } from '../../../assets/images/my-farm-es.svg';
import { ReactComponent as MyFarmIconPort } from '../../../assets/images/my-farm-pt.svg';
import { ReactComponent as TaskIcon } from '../../../assets/images/task_icon.svg';
// TODO: use profile picture stored in db
import { ReactComponent as ProfilePicture } from '../../../assets/images/navbar/defaultpfp.svg';
import PureMyFarmFloater from '../Floater/MyFarmFloater';
import { logout } from '../../../util/jwt';
import { useTranslation } from 'react-i18next';
import SmallerLogo from '../../../assets/images/smaller_logo.svg';
import SmallLogo from '../../../assets/images/small_logo.svg';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import { BiMenu } from 'react-icons/bi';
import { colors } from '../../../assets/theme';
import { ClickAwayListener, SwipeableDrawer } from '@material-ui/core';
import SlideMenu from './slideMenu';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { getLanguageFromLocalStorage } from '../../../util/getLanguageFromLocalStorage';
import { NavbarSpotlightProvider } from './NavbarSpotlightProvider';

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
    background:
      'linear-gradient(96.68deg,#78c99e -4.29%,#c7efd3 24.32%,#e3f8ec 35.52%,#e3f8ec 64.28%,#c7efd3 80.81%,#78c99e 125.09%)',
    boxShadow: 'none',
    minHeight: '54px',
    [theme.breakpoints.up('md')]: {
      minHeight: '72px',
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
  profileButton: {
    transform: 'translateY(-2px)',
  },
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
  resetSpotlight,
  history,
  showFinances,
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
  const [manageOpen, setManageOpen] = useState(true);
  const toggleManage = () => {
    setManageOpen(!manageOpen);
  };
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
  const taskIconClick = () => {
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
      'es': 'PLDRpVZ4VsXJhghxfEQuApFQTeCWUbGBN9',
      'pt': 'PLDRpVZ4VsXJg0ke20m47MmJq6uAJAlAGF',
      'en': 'PLDRpVZ4VsXJgVGrmmXJooNqceXvre8IDY'
    };

    const playList = playlistIDs[selectedLanguage] || playlistIDs['en'];
    const url = 'https://www.youtube.com/playlist?list=' + playList;

    const win = window.open(url, '_blank');
    win.focus();
    closeFloater();
  }

  // Pure Notification Floater
  const notificationTeaserClick = () => {
    closeFloater();
  };

  return (
    <AppBar position="sticky" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <IconButton
          edge="start"
          className={classes.menuButton}
          color="inherit"
          aria-label="open drawer"
          onClick={burgerMenuOnClick}
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
          <SlideMenu
            history={history}
            manageOpen={manageOpen}
            closeDrawer={closeDrawer}
            toggleManage={toggleManage}
            setIsDrawerOpen={setIsDrawerOpen}
            showFinances={showFinances}
          />
        </SwipeableDrawer>
        <Logo history={history} />
        <NavbarSpotlightProvider open={showSpotLight} onFinish={resetSpotlight}>
          <ClickAwayListener onClickAway={onClickAway}>
            <div className={classes.icons}>
              <PureMyFarmFloater
                openProfile={isFarmFloaterOpen}
                farmInfoClick={farmInfoClick}
                farmMapClick={farmMapClick}
                peopleClick={peopleClick}
                certificationClick={certificationClick}
              >
                <IconButton
                  aria-label='farm-icon'
                  color='inherit'
                  id='firstStepNavBar'
                  className={classes.iconButton}
                  onClick={farmButtonOnClick}
                >
                  {selectedLanguage === 'pt' ? (
                    <MyFarmIconPort />
                  ) : selectedLanguage === 'es' ? (
                    <MyFarmIconSpan />
                  ) : (
                    <MyFarmIcon />
                  )}
                </IconButton>
              </PureMyFarmFloater>

              <IconButton
                  aria-label='notification icon'
                  color='inherit'
                  id='secondStepNavBar'
                  onClick={taskIconClick}
                  className={classes.iconButton}
                  classes={{ root: classes.notificationButton }}
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
                  edge='end'
                  aria-label='profile icon'
                  color='inherit'
                  onClick={profileButtonOnClick}
                  id='thirdStepNavBar'
                  className={classes.iconButton}
                  classes={{ root: classes.profileButton }}
                >
                  <ProfilePicture />
                </IconButton>
              </PureProfileFloater>
            </div>
          </ClickAwayListener>
        </NavbarSpotlightProvider>
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
  setDefaultDateRange: PropTypes.func,
  showFinances: PropTypes.bool,
  defaultOpenFloater: PropTypes.oneOf(['farm', 'notification', 'profile']),
};
