import { ReactComponent as Logo } from '../../../../assets/images/navbar/nav-logo.svg';
import { ReactComponent as VectorUp } from '../../../../assets/images/navbar/vector-up.svg';
import { ReactComponent as VectorDown } from '../../../../assets/images/navbar/vector-down.svg';
import { useTranslation } from 'react-i18next';
import { List, ListItem, ListItemText } from '@mui/material';
import { isAdminSelector } from '../../../../containers/userFarmSlice';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

function SlideMenu({ history, manageOpen, closeDrawer, toggleManage, showFinances }) {
  const { t } = useTranslation();
  const handleClick = (link) => {
    history.push(link);
    closeDrawer();
  };
  const isAdmin = useSelector(isAdminSelector);
  return (
    <div role="presentation" className={styles.container}>
      <List>
        <Logo onClick={() => handleClick('/')} alt={'logo'} className={styles.logo} />
        <ListItem className={styles.listItem} button onClick={toggleManage}>
          <ListItemText
            classes={{ primary: styles.ListItemText }}
            primary={t('SLIDE_MENU.MANAGE')}
          />
          {manageOpen ? <VectorUp /> : <VectorDown />}
        </ListItem>
        {manageOpen && (
          <>
            <ListItem
              className={styles.subListItem}
              button
              onClick={() => {
                handleClick('/crop_catalogue');
              }}
            >
              <ListItemText
                classes={{ primary: styles.subListItemText }}
                primary={t('SLIDE_MENU.CROPS')}
              />
            </ListItem>
            <ListItem className={styles.subListItem} button onClick={() => handleClick('/tasks')}>
              <ListItemText
                classes={{ primary: styles.subListItemText }}
                primary={t('SLIDE_MENU.TASKS')}
              />
            </ListItem>
            {isAdmin && (
              <ListItem
                className={styles.subListItem}
                button
                onClick={() => handleClick('/documents')}
              >
                <ListItemText
                  classes={{ primary: styles.subListItemText }}
                  primary={t('SLIDE_MENU.DOCUMENTS')}
                />
              </ListItem>
            )}
          </>
        )}
        {showFinances && (
          <ListItem className={styles.listItem} button onClick={() => handleClick('/Finances')}>
            <ListItemText
              classes={{ primary: styles.ListItemText }}
              primary={t('SLIDE_MENU.FINANCES')}
            />
          </ListItem>
        )}

        <ListItem className={styles.listItem} button onClick={() => handleClick('/Insights')}>
          <ListItemText
            classes={{ primary: styles.ListItemText }}
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
