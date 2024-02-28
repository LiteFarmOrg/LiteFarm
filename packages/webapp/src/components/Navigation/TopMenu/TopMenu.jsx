import { useRef, useState } from 'react';
import { logout } from '../../../util/jwt';
import { getLanguageFromLocalStorage } from '../../../util/getLanguageFromLocalStorage';
import LogoutIcon from '../../../assets/images/navbar/logout.svg?react';
import MyInfoIcon from '../../../assets/images/navbar/my-info.svg?react';
import HelpIcon from '../../../assets/images/navbar/help.svg?react';
import VideoIcon from '../../../assets/images/navbar/play-square.svg?react';
import SwitchFarmIcon from '../../../assets/images/navbar/switch-farm.svg?react';
import LaunchIcon from '../../../assets/images/icon_launch.svg?react';
import CloseX from '../../../assets/images/close-x.svg?react';
import NotificationIcon from '../../../assets/images/notif.svg?react';
// TODO: use profile picture stored in db
import ProfilePicture from '../../../assets/images/navbar/defaultpfp.svg?react';
import IconLogo from '../../../assets/images/navbar/nav-logo.svg?react';
import WordsLogo from '../../../assets/images/middle_logo.svg?react';
import { BiMenu } from 'react-icons/bi';
import {
  AppBar,
  Toolbar,
  Menu,
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

const TopMenu = ({ history, isMobile, showNavActions, onClickBurger, showNav }) => {
  const { t } = useTranslation(['translation']);
  const profileIconRef = useRef(null);
  const selectedLanguage = getLanguageFromLocalStorage();
  const sectionHeader = useSectionHeader(history.location.pathname);

  const [openMenu, setOpenMenu] = useState(false);
  const toggleMenu = () => {
    setOpenMenu((prev) => !prev);
  };
  const closeMenu = () => {
    setOpenMenu(false);
  };

  const handleClick = (link) => {
    closeMenu();
    history.push(link);
  };

  const notificationIconClick = () => {
    const url = '/notifications';
    if (history.location.pathname === url) {
      // TODO click should update contents; is there better way than full page refresh?
      closeMenu();
      history.go();
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
      id: 'help',
      onClick: () => handleClick('/help'),
      icon: <HelpIcon />,
      label: t('PROFILE_FLOATER.HELP'),
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
      <Typography sx={{ flexGrow: 1 }} className={styles.sectionHeader}>
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
          {showNavActions && isMobile && <Logo withoutWords onClick={() => history.push('/')} />}
        </Toolbar>
      </AppBar>
    )
  );
};
export default TopMenu;
