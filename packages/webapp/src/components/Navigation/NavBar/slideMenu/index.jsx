import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';
import { matchPath } from 'react-router-dom';

import { ReactComponent as Logo } from '../../../../assets/images/middle_logo.svg';
import useExpandable from '../../../Expandable/useExpandableItem';
import { getAdministratorActionsList, getMenuList } from '../utils';
import styles from './styles.module.scss';

const MenuItem = ({ history, key, onClick, path, children }) => (
  <ListItemButton
    key={key}
    onClick={onClick ?? (() => history.push(path))}
    className={clsx(
      styles.listItem,
      matchPath(history.location.pathname, path) && styles.activeListItem,
    )}
  >
    {children}
  </ListItemButton>
);

function PureSlideMenu({ history, closeDrawer, isAdmin, classes = {} }) {
  const { expandedIds, toggleExpanded } = useExpandable({ isSingleExpandable: true });

  const handleClick = (link) => {
    history.push(link);
    closeDrawer?.();
  };

  return (
    <div role="presentation" className={clsx(classes.container, styles.container)}>
      <List className={styles.list}>
        <ListItemButton onClick={() => handleClick('/')} className={styles.listItem}>
          <Logo alt={'logo'} className={styles.logo} />
        </ListItemButton>
        {getMenuList(isAdmin, history).map(({ icon, label, path, subMenu }) => {
          if (!subMenu) {
            return (
              <MenuItem history={history} key={label} path={path}>
                <ListItemIcon className={styles.icon}>{icon}</ListItemIcon>
                <ListItemText primary={label} className={styles.listItemText} />
              </MenuItem>
            );
          }

          return (
            <React.Fragment key={label}>
              <MenuItem
                history={history}
                key={label}
                onClick={() => toggleExpanded(label)}
                path={path}
              >
                <ListItemIcon className={styles.icon}>{icon}</ListItemIcon>
                <ListItemText primary={label} className={styles.listItemText} />
                {expandedIds.includes(label) ? (
                  <ExpandLess className={styles.expandIcon} />
                ) : (
                  <ExpandMore className={styles.expandIcon} />
                )}
              </MenuItem>
              <Collapse in={expandedIds.includes(label)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {subMenu.map(({ label: subMenuLabel, path: subMenuPath }) => {
                    return (
                      <MenuItem history={history} key={subMenuLabel} path={subMenuPath}>
                        <ListItemText primary={subMenuLabel} className={styles.subItemText} />
                      </MenuItem>
                    );
                  })}
                </List>
              </Collapse>
            </React.Fragment>
          );
        })}
      </List>
      <List className={styles.list}>
        {getAdministratorActionsList().map(({ icon, label, path }) => {
          return (
            <MenuItem history={history} key={label} path={path}>
              <ListItemIcon className={styles.icon}>{icon}</ListItemIcon>
              <ListItemText primary={label} className={styles.listItemText} />
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
