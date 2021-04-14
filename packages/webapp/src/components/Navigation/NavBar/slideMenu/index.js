import React from 'react';
import { ReactComponent as Logo } from '../../../../assets/images/navbar/nav-logo.svg';
import { ReactComponent as VectorUp } from '../../../../assets/images/navbar/vector-up.svg';
import { ReactComponent as VectorDown } from '../../../../assets/images/navbar/vector-down.svg';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemText } from '@material-ui/core';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '204px',
  },
  logo: {
    margin: '16px 0 32px 24px',
    cursor: 'pointer',
  },
  listItem: {
    paddingLeft: theme.spacing(3),
  },
  ListItemText: {
    fontSize: '16px',
  },
  subListItem: {
    paddingLeft: theme.spacing(7),
  },
  subListItemText: {
    fontSize: '14px',
  },
}));

function SlideMenu({
  history,
  manageOpen,
  closeDrawer,
  toggleManage,
  setDefaultDateRange,
  showFinances,
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const handleClick = (link) => {
    history.push(link);
    closeDrawer();
  };
  return (
    <div role="presentation" className={classes.container}>
      <List>
        <Logo onClick={() => handleClick('/')} alt={'logo'} className={classes.logo} />
        <ListItem className={classes.listItem} button onClick={toggleManage}>
          <ListItemText
            classes={{ primary: classes.ListItemText }}
            primary={t('SLIDE_MENU.MANAGE')}
          />
          {manageOpen ? <VectorUp /> : <VectorDown />}
        </ListItem>
        {manageOpen && (
          <>
            <ListItem
              className={classes.subListItem}
              button
              onClick={() => {
                // setDefaultDateRange();
                handleClick('/Log');
              }}
            >
              <ListItemText
                classes={{ primary: classes.subListItemText }}
                primary={t('SLIDE_MENU.LOGS')}
              />
            </ListItem>
            <ListItem className={classes.subListItem} button onClick={() => handleClick('/Shift')}>
              <ListItemText
                classes={{ primary: classes.subListItemText }}
                primary={t('SLIDE_MENU.SHIFTS')}
              />
            </ListItem>
            <ListItem
              className={classes.subListItem}
              button
              onClick={() => handleClick('/Profile')}
            >
              <ListItemText
                classes={{ primary: classes.subListItemText }}
                primary={t('SLIDE_MENU.USERS')}
              />
            </ListItem>
          </>
        )}
        {showFinances && (
          <ListItem className={classes.listItem} button onClick={() => handleClick('/Finances')}>
            <ListItemText
              classes={{ primary: classes.ListItemText }}
              primary={t('SLIDE_MENU.FINANCES')}
            />
          </ListItem>
        )}

        <ListItem className={classes.listItem} button onClick={() => handleClick('/Insights')}>
          <ListItemText
            classes={{ primary: classes.ListItemText }}
            primary={t('SLIDE_MENU.INSIGHTS')}
          />
        </ListItem>
      </List>
    </div>
  );
}

export default SlideMenu;

SlideMenu.prototype = {
  history: PropTypes.object,
  manageOpen: PropTypes.bool,
  closeDrawer: PropTypes.func,
  toggleManage: PropTypes.func,
  setDefaultDateRange: PropTypes.func,
  showFinances: PropTypes.bool,
};
