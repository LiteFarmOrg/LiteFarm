import { useRef, useState } from 'react';
import { logout } from '../../../util/jwt';
import { getLanguageFromLocalStorage } from '../../../util/getLanguageFromLocalStorage';
import { ReactComponent as LogoutIcon } from '../../../assets/images/navbar/logout.svg';
import { ReactComponent as MyInfoIcon } from '../../../assets/images/navbar/my-info.svg';
import { ReactComponent as VideoIcon } from '../../../assets/images/navbar/play-square.svg';
import { ReactComponent as SwitchFarmIcon } from '../../../assets/images/navbar/switch-farm.svg';
import { ReactComponent as LaunchIcon } from '../../../assets/images/icon_launch.svg';
import { ReactComponent as CloseX } from '../../../assets/images/close-x.svg';
import { ReactComponent as NotificationIcon } from '../../../assets/images/notif.svg';
// TODO: use profile picture stored in db
import { ReactComponent as ProfilePicture } from '../../../assets/images/navbar/defaultpfp.svg';
import { ReactComponent as IconLogo } from '../../../assets/images/navbar/nav-logo.svg';
import { ReactComponent as WordsLogo } from '../../../assets/images/middle_logo.svg';
import { BiMenu } from 'react-icons/bi';
import {
  AppBar,
  Toolbar,
  MenuList,
  MenuItem,
  Popper,
  Grow,
  Paper,
  Drawer,
  ClickAwayListener,
  ListSubheader,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
} from '@mui/material';
import Alert from '../../../containers/Navigation/Alert';
import { useTranslation } from 'react-i18next';
import { useSectionHeader } from '../useSectionHeaders';
import clsx from 'clsx';
import styles from './styles.module.scss';
import FeedbackSurvey from '../../../containers/FeedbackSurvey';
import { useLocation, useNavigate } from 'react-router';

const TopMenu = ({
  isMobile,
  showNavActions,
  onClickBurger,
  showNav,
  isFeedbackSurveyOpen,
  setFeedbackSurveyOpen,
}) => {
  let navigate = useNavigate();
  let location = useLocation();
  const { t } = useTranslation(['translation']);
  const profileIconRef = useRef(null);
  const selectedLanguage = getLanguageFromLocalStorage();
  const sectionHeader = useSectionHeader(location.pathname);

  const [openMenu, setOpenMenu] = useState(false);
  const toggleMenu = () => {
    setOpenMenu((prev) => !prev);
  };
  const closeMenu = () => {
    setOpenMenu(false);
  };

  const handleClick = (link) => {
    closeMenu();
    navigate(link);
  };

  const notificationIconClick = () => {
    const url = '/notifications';
    if (location.pathname === url) {
      // TODO click should update contents; is there better way than full page refresh?
      closeMenu();
      navigate(0);
    } else {
      handleClick(url);
    }
  };

  const logOutClick = () => {
    closeMenu();
    logout();
  };

  const openTutorialsClick = () => {
    closeMenu();
    const playlistIDs = {
      es: 'PLDRpVZ4VsXJhghxfEQuApFQTeCWUbGBN9',
      pt: 'PLDRpVZ4VsXJg0ke20m47MmJq6uAJAlAGF',
      en: 'PLDRpVZ4VsXJgVGrmmXJooNqceXvre8IDY',
    };

    const playList = playlistIDs[selectedLanguage] || playlistIDs['en'];
    const url = 'https://www.youtube.com/playlist?list=' + playList;

    const win = window.open(url, '_blank');
    win.focus();
  };

  const options = [
    {
      id: 'user-profile',
      onClick: () => handleClick('/profile'),
      icon: <MyInfoIcon />,
      label: t('PROFILE_FLOATER.INFO'),
      externalLink: false,
    },
    {
      id: 'farm-selection',
      onClick: () => handleClick('/farm_selection'),
      icon: <SwitchFarmIcon />,
      label: t('PROFILE_FLOATER.SWITCH'),
      externalLink: false,
    },
    {
      id: 'tutorials',
      onClick: openTutorialsClick,
      icon: <VideoIcon />,
      label: t('PROFILE_FLOATER.TUTORIALS'),
      externalLink: true,
    },
    {
      id: 'logout',
      onClick: logOutClick,
      icon: <LogoutIcon style={{ transform: 'translateX(2px)' }} />,
      label: t('PROFILE_FLOATER.LOG_OUT'),
      externalLink: false,
    },
  ];

  const menuItems = options.map((option) => {
    const { id, onClick, icon, label, externalLink } = option;
    return (
      <MenuItem key={id} onClick={onClick} classes={{ root: styles.menuItemRoot }}>
        <ListItemIcon classes={{ root: styles.listItemIconRoot }}>{icon}</ListItemIcon>
        <ListItemText classes={{ root: styles.itemTextRoot }}>{label}</ListItemText>
        {externalLink && <LaunchIcon />}
      </MenuItem>
    );
  });

  const floaterMenu = (
    <Popper
      open={openMenu}
      anchorEl={profileIconRef.current}
      role={undefined}
      placement="bottom-start"
      transition
      disablePortal
    >
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin: 'right top',
          }}
        >
          <Paper classes={{ root: styles.floaterMenuPosition }}>
            <ClickAwayListener onClickAway={closeMenu}>
              <MenuList
                id="profile-menu"
                open={openMenu}
                aria-labelledby="profile-navigation-button"
                classes={{ list: styles.menuList, root: styles.menuRoot }}
              >
                {menuItems}
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );

  const drawerMenu = (
    <Drawer
      anchor={'bottom'}
      open={openMenu}
      onClose={() => setOpenMenu(false)}
      classes={{ paper: styles.drawerMenuPaper }}
    >
      <MenuList
        id="profile-menu"
        open={openMenu}
        onClose={closeMenu}
        aria-labelledby="profile-navigation-button"
        disablePadding
        classes={{ list: styles.drawerMenuList, paper: styles.drawerMenuPaper }}
      >
        <ListSubheader classes={{ root: styles.drawerListSubheader }}>
          <CloseX onClick={() => setOpenMenu(false)} />
        </ListSubheader>
        {menuItems}
      </MenuList>
    </Drawer>
  );

  const burgerMenuIcon = (
    <IconButton
      data-cy="navbar-hamburger"
      edge="start"
      color="inherit"
      aria-label="open drawer"
      onClick={() => onClickBurger((prev) => !prev)}
      className={styles.iconButton}
      size="large"
    >
      <BiMenu className={styles.burgerMenu} />
    </IconButton>
  );

  //Empty typography spaces toolbar correctly, replace with LF-3928 Breadcrumbs
  const showMainNavigation = (
    <>
      {isMobile && burgerMenuIcon}
      <Typography component="div" sx={{ flexGrow: 1 }} className={styles.sectionHeader}>
        {!isMobile && sectionHeader}
      </Typography>
      <IconButton
        data-cy="home-notificationButton"
        edge="end"
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
        onClick={toggleMenu}
        id="profile-navigation-button"
        className={styles.iconButton}
        size="large"
        aria-controls={openMenu ? 'profile-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={openMenu ? 'true' : undefined}
        ref={profileIconRef}
      >
        <ProfilePicture />
      </IconButton>
      <FeedbackSurvey
        isFeedbackSurveyOpen={isFeedbackSurveyOpen}
        setFeedbackSurveyOpen={setFeedbackSurveyOpen}
      />
      {isMobile ? drawerMenu : floaterMenu}
    </>
  );

  const Logo = ({ withoutWords, onClick }) => {
    if (withoutWords) {
      return (
        <IconButton onClick={onClick} className={styles.logo}>
          <IconLogo alt="LiteFarm Logo" />
        </IconButton>
      );
    }

    return <WordsLogo alt="LiteFarm Logo" className={styles.paddingTopBottom} />;
  };

  return (
    showNav && (
      <AppBar position="sticky" className={styles.appBar}>
        <Toolbar
          className={clsx(styles.toolbar, (!showNavActions || isMobile) && styles.centerContent)}
        >
          {!showNavActions ? <Logo /> : showMainNavigation}
          {showNavActions && isMobile && <Logo withoutWords onClick={() => navigate('/')} />}
        </Toolbar>
      </AppBar>
    )
  );
};
export default TopMenu;
