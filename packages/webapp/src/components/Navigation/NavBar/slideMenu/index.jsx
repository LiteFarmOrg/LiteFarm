import { useState } from 'react';
import { ReactComponent as Logo } from '../../../../assets/images/middle_logo.svg';
import { ReactComponent as VectorUp } from '../../../../assets/images/navbar/vector-up.svg';
import { ReactComponent as VectorDown } from '../../../../assets/images/navbar/vector-down.svg';
import { ReactComponent as FarmMapIcon } from '../../../../assets/images/farm-profile/farm-map.svg';
import { ReactComponent as FarmInfoIcon } from '../../../../assets/images/farm-profile/farm-info.svg';
import { ReactComponent as PeopleIcon } from '../../../../assets/images/farm-profile/people.svg';
import { ReactComponent as CertificationsIcon } from '../../../../assets/images/farm-profile/certificate.svg';
import { ReactComponent as MyFarmIcon } from '../../../../assets/images/my-farm.svg';
import { ReactComponent as MyFarmIconSpan } from '../../../../assets/images/my-farm-es.svg';
import { ReactComponent as MyFarmIconPort } from '../../../../assets/images/my-farm-pt.svg';
import { ReactComponent as MyFarmIconFren } from '../../../../assets/images/my-farm-fr.svg';
import { getLanguageFromLocalStorage } from '../../../../util/getLanguageFromLocalStorage';
import { useTranslation } from 'react-i18next';
import { List, ListItem, ListItemText } from '@mui/material';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

function PureSlideMenu({ history, closeDrawer, isAdmin, classes = {} }) {
  const [manageOpen, setManageOpen] = useState(true);
  const toggleManage = () => {
    setManageOpen(!manageOpen);
  };
  const [myFarmOpen, setMyFarmOpen] = useState(true);
  const toggleMyFarm = () => {
    setMyFarmOpen(!myFarmOpen);
  };

  const { t } = useTranslation();
  const handleClick = (link) => {
    history.push(link);
    closeDrawer?.();
  };

  const selectedLanguage = getLanguageFromLocalStorage();
  const getLanguageFarmIcon = (language) => {
    switch (language) {
      case 'pt':
        return <MyFarmIconPort />;
      case 'es':
        return <MyFarmIconSpan />;
      case 'fr':
        return <MyFarmIconFren />;
      default:
        return <MyFarmIcon />;
    }
  };

  return (
    <div role="presentation" className={classes.container}>
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
            <ListItem
              className={styles.subListItem}
              button
              onClick={() => handleClick('/tasks')}
              data-cy="home-taskButton"
            >
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
        {isAdmin && (
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
        <ListItem
          className={styles.listItem}
          button
          onClick={toggleMyFarm}
          data-cy="home-farmButton"
        >
          {getLanguageFarmIcon(selectedLanguage)}
          <ListItemText
            classes={{ primary: styles.ListItemText }}
            primary={t('SLIDE_MENU.MY_FARM')}
          />
          {myFarmOpen ? <VectorUp /> : <VectorDown />}
        </ListItem>
        {myFarmOpen && (
          <>
            <ListItem
              className={styles.subListItem}
              button
              onClick={() => {
                handleClick('/farm');
              }}
            >
              <FarmInfoIcon />
              <ListItemText
                classes={{ primary: styles.subListItemText }}
                primary={t('MY_FARM.FARM_INFO')}
              />
            </ListItem>
            <ListItem className={styles.subListItem} button onClick={() => handleClick('/map')}>
              <FarmMapIcon />
              <ListItemText
                classes={{ primary: styles.subListItemText }}
                primary={t('MY_FARM.FARM_MAP')}
              />
            </ListItem>
            <ListItem className={styles.subListItem} button onClick={() => handleClick('/people')}>
              <PeopleIcon />
              <ListItemText
                classes={{ primary: styles.subListItemText }}
                primary={t('MY_FARM.PEOPLE')}
              />
            </ListItem>
            {isAdmin && (
              <ListItem
                className={styles.subListItem}
                button
                onClick={() => handleClick('/certification')}
              >
                <CertificationsIcon />
                <ListItemText
                  classes={{ primary: styles.subListItemText }}
                  primary={t('MY_FARM.CERTIFICATIONS')}
                />
              </ListItem>
            )}
          </>
        )}
      </List>
    </div>
  );
}

export default PureSlideMenu;

PureSlideMenu.propTypes = {
  history: PropTypes.object,
  closeDrawer: PropTypes.func,
  isAdmin: PropTypes.bool,
};
