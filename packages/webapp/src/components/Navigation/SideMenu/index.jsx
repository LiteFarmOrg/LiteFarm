import { ExpandMore } from '@mui/icons-material';
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText, Menu } from '@mui/material';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { matchPath } from 'react-router-dom';

import useExpandable from '../../Expandable/useExpandableItem';
import { ReactComponent as Logo } from '../../../assets/images/middle_logo.svg';
import styles from './styles.module.scss';
import { useGetMenuItems } from '../../../hooks/useGetMenuItems';

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

function PureSideMenu({
  history,
  closeDrawer,
  isCompact,
  hasBeenExpanded,
  classes = { container: '' },
}) {
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

  return (
    <div
      role="presentation"
      className={clsx(
        styles.container,
        isCompact && styles.compactContainer,
        !isCompact && hasBeenExpanded && styles.expandedContainer,
        classes.container,
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
}

export default PureSideMenu;

PureSideMenu.propTypes = {
  history: PropTypes.object.isRequired,
  closeDrawer: PropTypes.func,
  isCompact: PropTypes.bool,
  hasBeenExpanded: PropTypes.bool,
  classes: PropTypes.shape({
    container: PropTypes.string,
  }),
};
