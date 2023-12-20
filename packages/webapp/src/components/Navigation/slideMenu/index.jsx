import { ChevronRight, ExpandLess, ExpandMore } from '@mui/icons-material';
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
import React, { forwardRef, useRef, useState } from 'react';
import { matchPath } from 'react-router-dom';

import useExpandable from '../../Expandable/useExpandableItem';
import { ReactComponent as FullVersionLogo } from '../../../assets/images/middle_logo.svg';
import { ReactComponent as CompactVersionLogo } from '../../../assets/images/nav-logo.svg';
import { ReactComponent as ExpandMenuIcon } from '../../../assets/images/nav/expand-menu.svg';
import { ReactComponent as CollapseMenuIcon } from '../../../assets/images/nav/collapse-menu.svg';
import { getAdministratorActionsList, getMenuList } from '../utils';
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

function PureSlideMenu({ history, closeDrawer, isAdmin, classes = { container: '' } }) {
  const [isCompact, setIsCompact] = useState(false);
  const { expandedIds, toggleExpanded, resetExpanded } = useExpandable({
    isSingleExpandable: true,
  });
  const expandableItemsRef = useRef({});

  const handleClick = (link) => {
    history.push(link);
    closeDrawer?.();
  };

  const onMenuItemClick = (link) => {
    handleClick(link);
    resetExpanded();
  };

  const Logo = isCompact ? CompactVersionLogo : FullVersionLogo;
  const ToggleMenuIcon = isCompact ? ExpandMenuIcon : CollapseMenuIcon;

  return (
    <div
      role="presentation"
      className={clsx(styles.container, isCompact && styles.compact, classes.container)}
    >
      <List className={styles.list}>
        <ListItemButton
          onClick={() => handleClick('/')}
          className={clsx(styles.listItem, styles.logoListItem)}
        >
          <Logo alt={'logo'} className={styles.logo} />
        </ListItemButton>
        <IconButton
          size="large"
          className={styles.toggleMenuButton}
          onClick={() => setIsCompact(!isCompact)}
        >
          <ToggleMenuIcon />
        </IconButton>
        {getMenuList(isAdmin, history).map(({ icon, label, path, subMenu, key }) => {
          if (!subMenu) {
            return (
              <MenuItem
                history={history}
                key={key}
                path={path}
                onClick={() => onMenuItemClick(path)}
              >
                <ListItemIcon className={styles.icon}>{icon}</ListItemIcon>
                {!isCompact && <ListItemText primary={label} className={styles.listItemText} />}
              </MenuItem>
            );
          }

          return (
            <React.Fragment key={label}>
              <MenuItem
                history={history}
                onClick={() => toggleExpanded(label)}
                path={path}
                ref={(el) => (expandableItemsRef.current[key] = el)}
              >
                <ListItemIcon className={styles.icon}>{icon}</ListItemIcon>
                {!isCompact ? (
                  <>
                    <ListItemText primary={label} className={styles.listItemText} />
                    {expandedIds.includes(label) ? (
                      <ExpandLess className={styles.expandIcon} />
                    ) : (
                      <ExpandMore className={styles.expandIcon} />
                    )}
                  </>
                ) : (
                  <ChevronRight className={styles.expandIcon} />
                )}
              </MenuItem>
              <SubMenu
                compact={isCompact}
                isExpanded={expandedIds.includes(label)}
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
        {getAdministratorActionsList().map(({ icon, label, path, key }) => {
          return (
            <MenuItem
              history={history}
              key={key}
              path={path}
              className={styles.adminActionListItem}
              onClick={() => onMenuItemClick(path)}
            >
              <ListItemIcon className={styles.icon}>{icon}</ListItemIcon>
              {!isCompact && <ListItemText primary={label} className={styles.listItemText} />}
            </MenuItem>
          );
        })}
      </List>
    </div>
  );
}

export default PureSlideMenu;

PureSlideMenu.propTypes = {
  history: PropTypes.object,
  closeDrawer: PropTypes.func,
  isAdmin: PropTypes.bool,
  classes: PropTypes.shape({
    container: PropTypes.string,
  }),
};
