import React, { useState } from 'react';
import ReactJoyride, { STATUS } from 'react-joyride';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import PureProfileFloater from '../../ProfileFloater';
import { ReactComponent as MyFarmIcon } from '../../../assets/images/my-farm.svg';
import { ReactComponent as MyFarmIconSpan } from '../../../assets/images/my-farm-es.svg';
import { ReactComponent as MyFarmIconPort } from '../../../assets/images/my-farm-pt.svg';
import { ReactComponent as TaskIcon } from '../../../assets/images/task_icon.svg';
// TODO: use profile picture stored in db
import { ReactComponent as ProfilePicture } from '../../../assets/images/navbar/defaultpfp.svg';
import PureMyFarmFloater from '../../MyFarmFloater';
import PureNotificationFloater from '../../NotificationFloater';
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
import { getLanguageFromLocalStorage } from '../../../util';
import { useDispatch, useSelector } from 'react-redux';
import { showedSpotlightSelector } from '../../../containers/showedSpotlightSlice';
import { setSpotlightToShown } from '../../../containers/Map/saga';

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
  const { introduce_map, navigation } = useSelector(showedSpotlightSelector);
  const isIntroducingFarmMap = !introduce_map && navigation;
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
  const closeFloater = () => setOpenFloater(null);
  const farmButtonOnClick = () => setOpenFloater(isFarmFloaterOpen ? null : FARM);
  const taskIconClick = () => {}; // <-- route to LF1748
  const profileButtonOnClick = () => setOpenFloater(isProfileFloaterOpen ? null : PROFILE);
  const onClickAway = () => {
    setOpenFloater(null);
  };

  const farmInfoClick = () => {
    if (!introduce_map) return;
    history.push({
      pathname: '/Profile',
      state: 'farm',
    });
    closeFloater();
  };
  const farmMapClick = () => {
    if (!introduce_map) dispatch(setSpotlightToShown('introduce_map'));
    history.push('/map');
    closeFloater();
  };
  const peopleClick = () => {
    if (!introduce_map) return;
    history.push({
      pathname: '/Profile',
      state: 'people',
    });
    closeFloater();
  };
  const certificationClick = () => {
    if (!introduce_map) return;
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
    history.push('/Profile');
    closeFloater();
  };

  // Pure Notification Floater
  const notificationTeaserClick = () => {
    closeFloater();
  };

  //Spotlight
  const resetSpotlightStatus = (data) => {
    const { action, status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) || action === 'close') {
      resetSpotlight();
    }
  };
  const farmSpotlight = t('NAVIGATION.SPOTLIGHT.FARM');
  const notificationsSpotlight = t('NAVIGATION.SPOTLIGHT.NOTIFICATION');
  const myProfileSpotlight = t('NAVIGATION.SPOTLIGHT.PROFILE');
  const steps = [
    {
      target: '#firstStep',
      title: returnContent(t('NAVIGATION.SPOTLIGHT.FARM_TITLE'), true, classes),
      content: returnContent(farmSpotlight, false, classes),
      locale: {
        next: returnNextButton(t('common:NEXT'), classes),
      },
      showCloseButton: false,
      disableBeacon: true,
      placement: 'right-start',
      styles: {
        options: {
          width: 240,
        },
      },
    },
    {
      target: '#secondStep',
      title: returnContent(t('NAVIGATION.SPOTLIGHT.NOTIFICATION_TITLE'), true, classes),
      content: returnContent(notificationsSpotlight, false, classes),
      locale: {
        next: returnNextButton(t('common:NEXT'), classes),
      },
      showCloseButton: false,
      placement: 'right-start',
      styles: {
        options: {
          width: 260,
        },
      },
    },
    {
      target: '#thirdStep',
      title: returnContent(t('NAVIGATION.SPOTLIGHT.PROFILE_TITLE'), true, classes),
      content: returnContent(myProfileSpotlight, false, classes),
      locale: {
        last: returnNextButton(t('common:GOT_IT'), classes),
      },
      placement: 'right-start',
      showCloseButton: false,
      styles: {
        options: {
          width: 210,
        },
        tooltip: {
          transform: 'translateX(-12px)',
        },
      },
      floaterProps: {
        styles: {
          floater: {
            marginRight: '0',
          },
        },
      },
    },
  ];
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
        <ClickAwayListener onClickAway={onClickAway}>
          <div className={classes.icons}>
            <PureMyFarmFloater
              openProfile={isFarmFloaterOpen}
              farmInfoClick={farmInfoClick}
              farmMapClick={farmMapClick}
              peopleClick={peopleClick}
              certificationClick={certificationClick}
              isIntroducingFarmMap={isIntroducingFarmMap}
            >
              <IconButton
                aria-label="farm-icon"
                color="inherit"
                id="firstStep"
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
            <PureNotificationFloater
              openProfile={isNotificationFloaterOpen}
              notificationTeaserClick={notificationTeaserClick}
            >
              <IconButton
                aria-label="notification icon"
                color="inherit"
                id="secondStep"
                onClick={taskIconClick}
                className={classes.iconButton}
                classes={{ root: classes.notificationButton }}
              >
                <TaskIcon />
              </IconButton>
            </PureNotificationFloater>

            <PureProfileFloater
              openProfile={isProfileFloaterOpen}
              helpClick={helpClick}
              myInfoClick={myInfoClick}
              logOutClick={logOutClick}
              switchFarmClick={switchFarmClick}
            >
              <IconButton
                edge="end"
                aria-label="profile icon"
                color="inherit"
                onClick={profileButtonOnClick}
                id="thirdStep"
                className={classes.iconButton}
                classes={{ root: classes.profileButton }}
              >
                <ProfilePicture />
              </IconButton>
            </PureProfileFloater>
          </div>
        </ClickAwayListener>
        {showSpotLight && (
          //Deprecated
          <ReactJoyride
            steps={steps}
            continuous
            callback={resetSpotlightStatus}
            floaterProps={{ disableAnimation: true }}
            styles={{
              options: {
                // modal arrow color
                arrowColor: '#fff',
                // modal background color
                backgroundColor: '#fff',
                // tooltip overlay color
                overlayColor: 'rgba(30, 30, 48, 1)',
                // next button color
                primaryColor: '#FCE38D',
                //width of modal
                width: 270,
                //zindex of modal
                zIndex: 1500,
              },
              buttonClose: {
                display: 'none',
              },
              buttonBack: {
                display: 'none',
              },
              tooltip: {
                padding: '20px',
              },
              tooltipContent: {
                padding: '4px 0 0 0',
                marginBottom: '20px',
              },
              buttonNext: {
                minWidth: '81px',
                minHeight: '32px',
                boxShadow: '0px 2px 8px rgba(102, 115, 138, 0.3)',
                marginTop: '9px',
                fontFamily: 'Open Sans, SansSerif, serif',
                fontWeight: 600,
                color: colors.grey900,
              },
            }}
          />
        )}
      </Toolbar>
    </AppBar>
  );
}

const returnContent = (spotlightType, title, classes) => {
  return spotlightType.split(',').map(function (item, key) {
    return title ? (
      <span key={key} className={classes.green}>
        <p align="left" className={classes.p}>
          {item}
        </p>
      </span>
    ) : (
      <span key={key}>
        <p align="left" className={classes.p}>
          {item}
        </p>
      </span>
    );
  });
};

const returnNextButton = (str, classes) => {
  return <span className={classes.black}>{str}</span>;
};

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
