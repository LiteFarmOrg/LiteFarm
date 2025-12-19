import { ExpandMore } from '@mui/icons-material';
import {
  Collapse,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
} from '@mui/material';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { matchPath, useNavigate, useLocation } from 'react-router-dom';

import useExpandable from '../../Expandable/useExpandableItem';
import { ReactComponent as Logo } from '../../../assets/images/middle_logo.svg';
import { useGetMenuItems } from '../../../hooks/useGetMenuItems';
import Drawer from '../../Drawer';
import { ReactComponent as CollapseMenuIcon } from '../../../assets/images/nav/collapse-menu.svg';
import styles from './styles.module.scss';
import { getLanguageFromLocalStorage } from '../../../util/getLanguageFromLocalStorage';

const MenuItem = forwardRef(({ onClick, path, children, className }, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = matchPath(location.pathname, path);
  return (
    <ListItemButton
      onClick={onClick ?? (() => navigate(path))}
      className={clsx(styles.listItem, isActive && styles.active, className)}
      ref={ref}
    >
      {children}
    </ListItemButton>
  );
});

MenuItem.displayName = 'MenuItem';

const SubMenu = ({ compact, children, isExpanded, ...props }) => {
  if (compact) {
    return (
      <Menu
        open={isExpanded}
        className={clsx(styles.list)}
        classes={{ list: styles.popoverMenu }}
        {...props}
      >
        <List component="div" disablePadding className={clsx(styles.subList, styles.tertiary)}>
          {children}
        </List>
      </Menu>
    );
  }

  return (
    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
      <List component="div" disablePadding className={clsx(styles.subList, styles.tertiary)}>
        {children}
      </List>
    </Collapse>
  );
};

const SideMenuContent = ({ closeDrawer, isCompact, hasBeenExpanded }) => {
  const navigate = useNavigate();
  const { expandedIds, toggleExpanded, resetExpanded } = useExpandable({
    isSingleExpandable: true,
  });
  const expandableItemsRef = useRef({});
  const { mainActions, adminActions } = useGetMenuItems();

  const handleClick = (link) => {
    navigate(link);
    closeDrawer?.();
  };

  const onMenuItemClick = (link) => {
    handleClick(link);
    resetExpanded();
  };

  useEffect(() => {
    resetExpanded();
  }, [isCompact]);

  return (
    <div
      role="presentation"
      className={clsx(
        styles.sideMenuContent,
        isCompact && styles.compactSideMenuContent,
        !isCompact && hasBeenExpanded && styles.expandedSideMenuContent,
      )}
    >
      <List className={clsx(styles.list, styles.primary)}>
        <ListItemButton
          onClick={() => handleClick('/')}
          className={clsx(styles.listItem, styles.logoListItem)}
        >
          <div className={clsx(styles.animatedLogo, isCompact && styles.compactLogo)}>
            <Logo alt={'logo'} />
          </div>
        </ListItemButton>
        {mainActions.map(({ icon, label, path, subMenu, key, badge }) => {
          if (subMenu) {
            return (
              <React.Fragment key={key}>
                <MenuItem
                  onClick={() => toggleExpanded(key)}
                  path={path}
                  ref={(el) => (expandableItemsRef.current[key] = el)}
                >
                  <ListItemIcon className={styles.icon}>{icon}</ListItemIcon>
                  <ListItemText
                    primary={label}
                    className={clsx(
                      styles.listItemText,
                      styles.animatedContent,
                      isCompact && styles.hiddenContent,
                    )}
                  />
                  {!isCompact && badge}
                  <ExpandMore
                    className={clsx(
                      styles.expandCollapseIcon,
                      expandedIds.includes(key) && styles.collapseIcon,
                      isCompact && styles.compactExpandIcon,
                    )}
                  />
                </MenuItem>
                <SubMenu
                  compact={isCompact}
                  isExpanded={expandedIds.includes(key)}
                  onClose={resetExpanded}
                  anchorEl={expandableItemsRef.current[key]}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  {subMenu.map(({ label: subMenuLabel, path: subMenuPath, key: subMenuKey }) => {
                    return (
                      <MenuItem
                        key={subMenuKey}
                        path={subMenuPath}
                        className={styles.subItem}
                        onClick={() =>
                          isCompact ? onMenuItemClick(subMenuPath) : handleClick(subMenuPath)
                        }
                      >
                        <ListItemText primary={subMenuLabel} className={styles.subItemText} />
                      </MenuItem>
                    );
                  })}
                </SubMenu>
              </React.Fragment>
            );
          }

          return (
            <MenuItem key={key} path={path} onClick={() => onMenuItemClick(path)}>
              <ListItemIcon className={styles.icon}>{icon}</ListItemIcon>
              <ListItemText
                primary={label}
                className={clsx(
                  styles.listItemText,
                  styles.animatedContent,
                  isCompact && styles.hiddenContent,
                )}
              />
              {!isCompact && badge}
            </MenuItem>
          );
        })}
      </List>
      <List className={clsx(styles.list, styles.secondary)}>
        {adminActions.map(({ icon, label, path, key }) => {
          return (
            <MenuItem
              key={key}
              path={path}
              className={styles.adminActionListItem}
              onClick={() => onMenuItemClick(path)}
            >
              <ListItemIcon className={styles.icon}>{icon}</ListItemIcon>
              <ListItemText
                primary={label}
                className={clsx(
                  styles.listItemText,
                  styles.animatedContent,
                  isCompact && styles.hiddenContent,
                )}
              />
            </MenuItem>
          );
        })}
      </List>
    </div>
  );
};

const PureSideMenu = ({ isMobile, isDrawerOpen, onDrawerClose, isCompact, setIsCompact }) => {
  const [hasBeenExpanded, setHasBeenExpanded] = useState(false);
  const selectedLanguage = getLanguageFromLocalStorage();

  useLayoutEffect(() => {
    const rootElement = document.querySelector(':root');
    if (isMobile) {
      rootElement.style.setProperty('--global-side-menu-width', '0px');
    } else if (selectedLanguage.includes('ml')) {
      rootElement.style.setProperty('--global-side-menu-width', '224px');
    } else {
      rootElement.style.setProperty('--global-side-menu-width', '188px');
    }
  }, [selectedLanguage, isMobile]);

  const toggleSideMenu = () => {
    setHasBeenExpanded(isCompact);
    setIsCompact(!isCompact);
  };

  return isMobile ? (
    <div className={styles.drawer}>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        fullHeight
        classes={{
          drawerContainer: styles.drawerContainer,
          drawerHeader: styles.drawerHeader,
          drawerContent: styles.drawerContent,
        }}
      >
        <SideMenuContent closeDrawer={onDrawerClose} />
      </Drawer>
    </div>
  ) : (
    <>
      <IconButton
        size="large"
        className={clsx(
          styles.menuToggle,
          isCompact && styles.compactMenuToggle,
          hasBeenExpanded && styles.expandedMenuToggle,
        )}
        onClick={toggleSideMenu}
      >
        <CollapseMenuIcon />
      </IconButton>
      <SideMenuContent isCompact={isCompact} hasBeenExpanded={hasBeenExpanded} />
    </>
  );
};

PureSideMenu.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  isDrawerOpen: PropTypes.bool,
  onDrawerClose: PropTypes.func,
  isCompact: PropTypes.bool,
  setIsCompact: PropTypes.func,
};

export default PureSideMenu;
