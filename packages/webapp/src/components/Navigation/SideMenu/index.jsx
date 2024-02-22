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
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { matchPath } from 'react-router-dom';

import useExpandable from '../../Expandable/useExpandableItem';
import { ReactComponent as Logo } from '../../../assets/images/middle_logo.svg';
import { useGetMenuItems } from '../../../hooks/useGetMenuItems';
import Drawer from '../../Drawer';
import { ReactComponent as CollapseMenuIcon } from '../../../assets/images/nav/collapse-menu.svg';
import styles from './styles.module.scss';

const MenuItem = forwardRef(({ history, onClick, path, children, className }, ref) => {
  return (
    <ListItemButton
      onClick={onClick ?? (() => history.push(path))}
      className={clsx(
        styles.listItem,
        matchPath(history.location.pathname, path)
          ? styles.activeListItem
          : styles.inactiveListItem,
        className,
      )}
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
      <Menu open={isExpanded} {...props}>
        {children}
      </Menu>
    );
  }

  return (
    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
      <List component="div" disablePadding className={styles.subList}>
        {children}
      </List>
    </Collapse>
  );
};

export const SideMenuContent = ({ history, closeDrawer, isCompact, hasBeenExpanded }) => {
  const { expandedIds, toggleExpanded, resetExpanded } = useExpandable({
    isSingleExpandable: true,
  });
  const expandableItemsRef = useRef({});
  const { mainActions, adminActions } = useGetMenuItems();

  const handleClick = (link) => {
    history.push(link);
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
        styles.container,
        isCompact && styles.compactContainer,
        !isCompact && hasBeenExpanded && styles.expandedContainer,
      )}
    >
      <List className={styles.list}>
        <ListItemButton
          onClick={() => handleClick('/')}
          className={clsx(styles.listItem, styles.logoListItem)}
        >
          <div className={clsx(styles.animatedLogo, isCompact && styles.compactLogo)}>
            <Logo alt={'logo'} />
          </div>
        </ListItemButton>
        {mainActions.map(({ icon, label, path, subMenu, key }) => {
          if (!subMenu) {
            return (
              <MenuItem
                history={history}
                key={key}
                path={path}
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
          }

          return (
            <React.Fragment key={key}>
              <MenuItem
                history={history}
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
                      history={history}
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
        })}
      </List>
      <List className={styles.list}>
        {adminActions.map(({ icon, label, path, key }) => {
          return (
            <MenuItem
              history={history}
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

const PureSideMenu = ({
  history,
  isMobile,
  isDrawerOpen,
  onDrawerClose,
  isCompact,
  setIsCompact,
}) => {
  const [hasBeenExpanded, setHasBeenExpanded] = useState(false);

  const toggleSideMenu = () => {
    setHasBeenExpanded(isCompact);
    setIsCompact(!isCompact);
  };

  return isMobile ? (
    <div className={styles.sideMenu}>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        fullHeight
        responsiveModal={false}
        classes={{
          container: styles.drawerContainer,
          header: styles.drawerHeader,
          content: styles.drawerContent,
        }}
      >
        <SideMenuContent history={history} closeDrawer={onDrawerClose} />
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
      <SideMenuContent history={history} isCompact={isCompact} hasBeenExpanded={hasBeenExpanded} />
    </>
  );
};

PureSideMenu.propTypes = {
  history: PropTypes.object.isRequired,
  isMobile: PropTypes.bool.isRequired,
  isDrawerOpen: PropTypes.bool,
  onDrawerClose: PropTypes.func,
  isCompact: PropTypes.bool,
  setIsCompact: PropTypes.func,
};

export default PureSideMenu;
